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
	"fmt"
	"go/pkg/log"
)

type Initializer interface {
	Init(name string, description string)
}

type Base struct {
	name        string
	description string
}

func (b *Base) Init(name string, description string) {
	b.name = name
	b.description = description
}

func (b *Base) Name() string {
	return b.name
}

func (b *Base) Description() string {
	return b.description
}

func (b *Base) Debugf(format string, args ...interface{}) {
	log.Debugf("[%s] %s", b.name, fmt.Sprintf(format, args...))
}

func (b *Base) Warningf(format string, args ...interface{}) {
	log.Warningf("[%s] %s", b.name, fmt.Sprintf(format, args...))
}

func (b *Base) Infof(format string, args ...interface{}) {
	log.Infof("[%s] %s", b.name, fmt.Sprintf(format, args...))
}

func (b *Base) Errf(format string, args ...interface{}) {
	log.Errf("[%s] %s", b.name, fmt.Sprintf(format, args...))
}

func (b *Base) Critf(format string, args ...interface{}) {
	log.Critf("[%s] %s", b.name, fmt.Sprintf(format, args...))
}
