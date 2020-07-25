#!/usr/bin/env python
# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.
#
"""Help maintaining DLL import lists."""
import ast
import optparse
import re
import sys


_EXPORT_RE = re.compile(r"""
  ^\s*(?P<ordinal>[0-9]+)  # The ordinal field.
  \s+(?P<hint>[0-9A-F]+)   # The hint field.
  \s(?P<rva>........)      # The RVA field.
  \s+(?P<name>[^ ]+)       # And finally the name we're really after.
""", re.VERBOSE)


_USAGE = r"""\
Usage: %prog [options] [main-file]

This script filters a list of exports from a DLL, generated from something
like the following command line:

C:\> dumpbin /exports user32.dll

against a main list of imports built from e.g.

C:\> dumpbin /exports user32.lib

The point of this is to trim non-public exports from the list, and to
normalize the names to their stdcall-mangled form for the generation of
import libraries.
Note that the export names from the latter incanatation are stdcall-mangled,
e.g. they are suffixed with "@" and the number of argument bytes to the
function.
"""

def _ReadMainFile(main_file):
  # Slurp the main file.
  with open(main_file) as f:
    main_exports = ast.literal_eval(f.read())

  main_mapping = {}
  for export in main_exports:
    name = export.split('@')[0]
    main_mapping[name] = export

  return main_mapping


def main():
  parser = optparse.OptionParser(usage=_USAGE)
  parser.add_option('-r', '--reverse',
                    action='store_true',
                    help='Reverse the matching, e.g. return the functions '
                         'in the main list that aren\'t in the input.')

  options, args = parser.parse_args()
  if len(args) != 1:
    parser.error('Must provide a main file.')

  main_mapping = _ReadMainFile(args[0])

  found_exports = []
  for line in sys.stdin:
    match = _EXPORT_RE.match(line)
    if match:
      export_name = main_mapping.get(match.group('name'), None)
      if export_name:
          found_exports.append(export_name)

  if options.reverse:
    # Invert the found_exports list.
    found_exports = set(main_mapping.values()) - set(found_exports)

  # Sort the found exports for tidy output.
  print '\n'.join(sorted(found_exports))
  return 0


if __name__ == '__main__':
  sys.exit(main())
