Feature: Coach can see and review reports

  Background:
    Given I am signed in to Kolibri as Coach
      And I am at *Coach - '<class>' > Lessons*
      And there are learners who have interacted with different resource types

	Scenario: Review the resource progress report
  	Given I am at the lesson details page for a lesson
    When I click on a resource
    Then I see the resource progress report
    	And I see the title of the resource, class to which the resource is assigned, progress made, and average time spent
    	And I see a *View by groups* checkbox
    	And I see the learners table with *Name*, *Progress*, *Time spent*, *Groups* and *Last activity* columns
      And in the *Progress* column I see the summary icons and labels (Completed, Started, Not started, and Need help)
      And in the top right I see the *View learner devices* link, *Print report* icon, *Export as CSV* icon and a *Preview* button

  Scenario: Coach can view the learners by groups
    Given I am at viewing the resource progress report page
		When I click the *View by groups* checkbox
		Then I see separate tables for each available group

  Scenario: Coach can preview a resource
  	Given I am at viewing the resource progress report page
    When I click *Preview* button
    Then I can see the resource preview
    When I click the back arrow button
    Then I am back at the resource progress report page

  Scenario: Coach can review the learners progress from the *Learners* subtab
    Given I am in the *Learners* tab of a lesson
    When I click on the name of a learner
    Then I see the name of the learner
    	And I see a table with *Title*, *Progress* and *Time spent* columns
    	And I see the lesson resources and the progress made by the learner
    	And in the top right I see the *Print report* and *Export as CSV* icons

	Scenario: Coach can view the  individual learner progress for a practice quiz
    Given that as a learner I have completed and submitted a practice quiz
    When I click on the title of a practice quiz
    Then I see the individual learner progress of the practice quiz in a table
      And I see a subtab with difficult questions
      And I see a button that has a preview of the practice quiz
      And I see a column in the table with latest score and attempts
