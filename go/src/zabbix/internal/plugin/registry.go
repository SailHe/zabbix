/*
** Zabbix
** Copyright (C) 2001-2019 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/

package plugin

import (
	"errors"
	"fmt"
	"reflect"
)

type Metric struct {
	Plugin      Accessor
	Key         string
	Description string
}

var Metrics map[string]*Metric = make(map[string]*Metric)
var Plugins map[string]Accessor = make(map[string]Accessor)

func RegisterMetric(plugin Accessor, name string, key string, description string) {
	if _, ok := Metrics[key]; ok {
		panic(fmt.Sprintf(`cannot register duplicate metric "%s"`, key))
	}

	t := reflect.TypeOf(plugin)
	for i := 0; i < t.NumMethod(); i++ {
		method := t.Method(i)
		switch method.Name {
		case "Export":
			if _, ok := plugin.(Exporter); !ok {
				panic(fmt.Sprintf(`the "%s" plugin %s method does not match Exporter interface`, name, method.Name))
			}
		case "Collect", "Period":
			if _, ok := plugin.(Collector); !ok {
				panic(fmt.Sprintf(`the "%s" plugin %s method does not match Collector interface`, name, method.Name))
			}
		case "Watch":
			if _, ok := plugin.(Watcher); !ok {
				panic(fmt.Sprintf(`the "%s" plugin %s method does not match Watcher interface`, name, method.Name))
			}
		case "Configure":
			if _, ok := plugin.(Configurator); !ok {
				panic(fmt.Sprintf(`the "%s" plugin %s method does not match Configurator interface`, name, method.Name))
			}
		case "Start", "Stop":
			if _, ok := plugin.(Runner); !ok {
				panic(fmt.Sprintf(`the "%s" plugin %s method does not match Runner interface`, name, method.Name))
			}
		}
	}
	switch plugin.(type) {
	case Exporter, Collector, Runner, Watcher, Configurator:
	default:
		panic(fmt.Sprintf(`plugin "%s" does not implement any plugin interfaces`, name))
	}

	if p, ok := Plugins[name]; ok {
		if p != plugin {
			panic(fmt.Sprintf(`plugin name "%s" has been already registred by other plugin`, name))
		}
	} else {
		Plugins[name] = plugin
		plugin.Init(name)
	}

	Metrics[key] = &Metric{Plugin: plugin, Key: key, Description: description}
}

func Get(key string) (acc Accessor, err error) {
	if m, ok := Metrics[key]; ok {
		return m.Plugin, nil
	}
	return nil, errors.New("no plugin found")
}

func ClearRegistry() {
	Metrics = make(map[string]*Metric)
	Plugins = make(map[string]Accessor)
}
