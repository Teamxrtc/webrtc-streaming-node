/*
 * Copyright (C) 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.i18n.addressinput.common;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Tests for the region data constants to check they are populated and that the data can be read in
 * and converted into the appropriate format.
 */
@RunWith(JUnit4.class)
public class RegionDataConstantsTest {
  @Test public void testDataLoad() throws Exception {
    assertFalse("The list of countries should not be empty",
        RegionDataConstants.getCountryFormatMap().isEmpty());
  }

  @Test public void testZZRegion() throws Exception {
    assertNotNull("Data for 'ZZ' is missing (needed for default region info.)",
        RegionDataConstants.getCountryFormatMap().get("ZZ"));
  }

  @Test public void testStringsAreConvertedIntoJson() throws Exception {
    String[] input = {"key", "value", "key2", "value2"};
    // Input order is not maintained, since we build this using JSON objects. This is
    // unimportant, so long as the key-value mappings are maintained.
    String expectedOutput1 = "{\"key\":\"value\",\"key2\":\"value2\"}";
    String expectedOutput2 = "{\"key2\":\"value2\",\"key\":\"value\"}";
    String actualOutput = RegionDataConstants.convertArrayToJsonString(input);
    assertTrue(actualOutput.equals(expectedOutput1) || actualOutput.equals(expectedOutput2));
  }
}
