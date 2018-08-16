    Background: get current logged in user

    Scenario: already logged in
        Given already logged in with correct email and password
        When I request me route
        Then should see my user id, name and email

    Scenario: dont logged in
        Given dont logged in
        When I request /me route
        Then should see null