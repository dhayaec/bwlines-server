  Background: New user registration

  Scenario: Register with invalid details
    Given See Register Form
    When Enter empty name='', email='some', password='' press register
    Then Should see validation errors

  Scenario: Register through bot
    Given when fill register form with bot
    Then should see captcha warning from Invisible ReCaptcha

  Scenario: Register with correct details
    Given See register Form
    When Enter valid name=example, email=example@example.com, password=123456
    Then should see registered user id, name and email
    Then should receive an email to example@example.com containing activation link

  Scenario: Register with same user details
    Given see register Form
    When Enter valid name=example, email=example@example.com, password=123456 again
    Then should see email already exists error

