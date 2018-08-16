    Background: logged in and on add new catalogue page

    Scenario: add invalid catalogue
        Given see Add new catalogue form
        When I enter invalid details such as name='', price=''
        Then  should see validation errors
        And when correct errors errors should disappear

    Scenario: add valid catalogue details
        Given see Add new catalogue form
        When I fill all details correctly
        Then should see catalogue added successfully message