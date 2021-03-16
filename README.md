<h1 align="center">
  <a><img src="https://github.com/ChronicStone/sweetforms/blob/main/logo_sweetforms.svg" alt="SweetForms" width="200"></a>
</h1>

<h4 align="center">A package based on  <a href="https://github.com/sweetalert2/sweetalert2" target="_blank">Sweetalert2</a>. that profides highly customizable promised-based popup forms, with features like form advanced validation, optional http request handling, multiple-steps, and many more !</h4>

<p align="center">
  <a href="https://badge.fury.io/js/%40chronicstone%2Fsweetforms">
    <img src="https://badge.fury.io/js/%40chronicstone%2Fsweetforms.svg" alt="npm version" height="18">
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#documentation-and-examples">Documentation & Examples</a> •
  <a href="#improvements-roadmap">Improvements roadmap</a> •
  <a href="#credits">Credits</a>
</p>

## Key Features

* Grid-based templating - Create your layouts
  - High depth of forms layout customisation, based on css grid
* High variety of fields input availables
  - List of supported input types : text, textarea, email, password, number, select, radio, checkbox, file, week, month, time, datetime-local, date
  - Custom input types coming soon (Data-table select, and others !)
* Support advanced customisable validation
  - Includes basic validators : required, email, phone number. Other validators comming soon
  - Custom validators : Define your own validators and apply them to any field. Supports assynchroneous task check 
* Dark/Light mode
* Supports multiple steps forms
* Provide feedback functions that allow you to show success / error feedback after processing form content
* 100% Responsive
* Works with VanillaJS, and any front-end javascript framework (Vue, React, Angular, ..)

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Install the package
$ npm install --save @chronicstone/sweetforms
```

```js
// Import the package to your project
import { SimpleForm, SteppedForm } from "@chronicstone/sweetforms"

// Call one of the provided methods to generate your form.
SimpleForm({
  themeConfig: {
    darkMode: false
  },
  itemsByLine: 1
  title: "Sign in"
  fields: [
    {
      label: "Email address",
      key: "email",
      type: "text",
      validation: ['email']
    },
    {
      label: "Password",
      key: "email",
      type: "password",
      validation: ['email']
    }
  ]
}).then(result => {
  const {success, formData, ShowFeedback } = result
  // ... Do some stuff here
  
  // ShowFeedback method allow you to display a feedback popup after processing the form content if needed
  ShowFeedback({success: true, title: "Form completed !", text: "", timer: 3000})
})
```

## Documentation and examples

* Comming soon

## Improvements roadmap

- [ ]  Webpack bundle + tailwind setup
- [ ]  Tailwind-based css rework
- [ ]  Add support for more data-forms
- [ ]  Add input / output parsing module for fields values. (Handling of objects / array, multi-select checkboxes, ...)
- [ ]  Add new input formats
- [ ]  Add new default validators

## Credits

This package is entirely based on <a href="https://github.com/sweetalert2/sweetalert2" target="_blank">Sweetalert2</a>, and its promise-based notification system.

## You want to improve this library ? Or any ideas of improvements ?

This project is 100 % open-source, do not hesitate to give feedback on the library, ask for new features or even make a pull request. Any participation is welcomed.

## License

MIT

---

> GitHub [@ChronicStone](https://github.com/ChronicStone) &nbsp;&middot;&nbsp;
