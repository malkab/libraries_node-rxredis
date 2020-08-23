# Publishing Workflow

Steps:

- test **npm run build**;

- close the Git Flow feature and go back to **develop**;

- test **npm publish**, changing version at **package.json** and **package-lock.json** if needed;

- if applicable, create a new Git Flow Release;

- push all branches and tags to GitLab;

- create a new Release at GitLab from the last **master**.
