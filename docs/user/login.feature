    Background: login flow

    Scenario: login with non existing email
        Given see login form and dont have any registered email
        When  enter non existing email=nonexisting@example.com , password=123456 and submit
        Then should see error invalid login

    Scenario: login with invalid password
        Given see login from and have already registered email=example@example.com
        When enter email=example@example.com and password=wrong
        Then should see error invalid login

    Scenario: login with correct password
        Given see login from
        When enter email=example@example.com and password=123456
        Then should see logged in user id



