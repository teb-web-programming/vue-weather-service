Feature: Weather comparison

  Scenario: Add two locations, compare their weather, and remove one
    Given the weather dashboard is open
    When I search for "Edinburgh"
    And I select "Edinburgh" from the results
    Then the weather for "Edinburgh" should be displayed
    When I search for "London"
    And I select "London" from the results
    Then the weather for "Edinburgh" should be displayed
    And the weather for "London" should be displayed
    And the comparison panel should be visible
    When I remove "Edinburgh" from the selected locations
    Then "London" should remain selected
    And "Edinburgh" should no longer be displayed
