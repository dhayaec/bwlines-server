    Background: already registered email=example@example.com and forgot password

    Scenario: enter correct email
        Given See forgot page and have registered email example@example.com
        When Enter email=example@example.com and submit
        Then should see reset link sent message
        Then should receive an email containing reset lint to example@example.com

    Scenario: enter wrong email
        When I enter non existing email address
        Then should see email is not registered with us
        When more than 3 wrong attempts made
        Then should include captcha

    Background: Clicking on reset link in email

    Scenario: clicking on valid reset link
        Given When Clicking on reset link in email sent
        Then should see form with new password and confirm password
        When enter correct password
        Then should see new password set message

    Scenario: clicking on invalid reset link
        Given When Clicking on reset link in email sent
        Then should see link expired message
        And show forgot password link


