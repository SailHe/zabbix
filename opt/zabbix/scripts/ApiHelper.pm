package ApiHelper;

use strict;
use warnings;
use File::Path qw(make_path);
use DateTime::Format::RFC3339;
use base 'Exporter';

use constant AH_SUCCESS => 0;
use constant AH_FAIL => 1;
use constant AH_BASE_DIR => '/opt/zabbix/sla';

use constant AH_INCIDENT_ACTIVE => 'ACTIVE';
use constant AH_END_FILE => 'end';
use constant AH_FALSE_POSITIVE_FILE => 'false_positive';
use constant AH_FALSE_POSITIVE => 'YES';
use constant AH_NOT_FALSE_POSITIVE => 'NO';
use constant AH_ALARMED_FILE => 'alarmed';
use constant AH_ALARMED_YES => 'YES';
use constant AH_ALARMED_NO => 'NO';
use constant AH_ALARMED_DISABLED => 'DISABLED';

our @EXPORT = qw(AH_SUCCESS AH_FAIL AH_ALARMED_YES AH_ALARMED_NO AH_ALARMED_DISABLED ah_get_error ah_save_alarmed ah_save_incident);

my $error_string = "";

sub ah_get_error
{
    return $error_string;
}

sub __make_base_path
{
    my $tld = shift;
    my $service = shift;

    return AH_BASE_DIR . "/$tld/$service";
}

sub __make_inc_path
{
    my $tld = shift;
    my $service = shift;
    my $start = shift;
    my $eventid = shift;

    return __make_base_path($tld, $service) . "/incidents/$start.$eventid";
}

sub __set_error
{
    $error_string = shift;
}

sub __set_file_error
{
    my $err = shift;

    $error_string = "";

    if (@$err)
    {
	for my $diag (@$err)
	{
	    my ($file, $message) = %$diag;
	    if ($file eq '')
	    {
		$error_string .= "$message. ";
	    }
	    else
	    {
		$error_string .= "$file: $message. ";
	    }

	    return;
	}
    }
}

# sub __unlink_file
# {
#     my $full_path = shift;

#     if (-f $full_path)
#     {
# 	unless (unlink($full_path))
# 	{
# 	    __set_error("cannot delete file $full_path: $!");
# 	    return AH_FAIL;
# 	}
#     }

#     return AH_SUCCESS;
# }

sub __write_file
{
    my $full_path = shift;
    my $text = shift;

    my $OUTFILE;

    unless (open($OUTFILE, '>', $full_path))
    {
	__set_error("cannot open file $full_path: $!");
	return AH_FAIL;
    }

    unless (print { $OUTFILE } $text)
    {
	__set_error("cannot write to file $full_path: $!");
	return AH_FAIL;
    }

    close($OUTFILE);

    return AH_SUCCESS;
}

sub __apply_inc_end
{
    my $inc_path = shift;
    my $end = shift;

    my $end_path = "$inc_path/".AH_END_FILE;

    return __write_file($end_path, AH_INCIDENT_ACTIVE) unless (defined($end));

    my $dt = DateTime->from_epoch('epoch' => $end);
    my $f = DateTime::Format::RFC3339->new();

    return __write_file($end_path, $f->format_datetime($dt));
}

sub __apply_inc_false_positive
{
    my $inc_path = shift;
    my $false_positive = shift;

    my $false_positive_path = "$inc_path/".AH_FALSE_POSITIVE_FILE;

    return __write_file($false_positive_path, $false_positive == 0 ? AH_NOT_FALSE_POSITIVE : AH_FALSE_POSITIVE);
}

sub ah_save_alarmed
{
    my $tld = shift;
    my $service = shift;
    my $status = shift;

    my $alarmed_path = __make_base_path($tld, $service);

    make_path($alarmed_path, {error => \my $err});

    if (@$err)
    {
        __set_file_error($err);
        return AH_FAIL;
    }

    $alarmed_path .= "/" . AH_ALARMED_FILE;

    return __write_file($alarmed_path, $status);
}

sub ah_save_incident
{
    my $tld = shift;
    my $service = shift;
    my $eventid = shift; # incident is identified by event ID
    my $start = shift;
    my $end = shift;
    my $false_positive = shift;

    $tld = lc($tld);
    $service = lc($service);

    my $inc_path = __make_inc_path($tld, $service, $start, $eventid);

    make_path($inc_path, {error => \my $err});

    if (@$err)
    {
	__set_file_error($err);
	return AH_FAIL;
    }

    return AH_FAIL unless (__apply_inc_end($inc_path, $end) == AH_SUCCESS);

    return __apply_inc_false_positive($inc_path, $false_positive);
}

1;
