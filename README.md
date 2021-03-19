<h1 align="center">
  <a><img src="https://github.com/ChronicStone/sweetforms/blob/main/logo_sweetforms.svg" alt="SweetForms" width="200"></a>
</h1>

<h4 align="center">A package based on  <a href="https://github.com/sweetalert2/sweetalert2" target="_blank">Sweetalert2</a>. that provides highly customizable promised-based popup forms, with features like form advanced validation, optional http request handling, multiple-steps, and many more !</h4>

<p align="center">
  <a href="https://badge.fury.io/js/%40chronicstone%2Fsweetforms">
    <img src="https://badge.fury.io/js/%40chronicstone%2Fsweetforms.svg" alt="npm version" height="18">
  </a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#documentation-and-live-examples">Documentation & Live Examples</a> •
  <a href="#improvements-roadmap">Improvements roadmap</a> •
  <a href="#credits">Credits</a>
</p>

## Key Features

- Grid-based templating - Create your layouts
  - High depth of forms layout customisation, based on css grid
- A lot of input types supported
  - List of supported input types : text, textarea, email, password, number, select, radio, checkbox, file, week, month, time, datetime-local, date
  - Custom input types coming soon (Data-table select, and many others)
- Support advanced customisable validation
  - Includes basic validators : required, email, phone number. Other validators comming soon
  - Custom validators : Define your own validators and apply them to any field. Promise-based, supports async
- Dark/Light mode
- Supports multiple steps forms
- Provide feedback functions that allow you to show success / error feedback after processing form content
- 100% Responsive
- Works with VanillaJS, and any front-end javascript framework (Vue, React, Angular, ..)

## How To Use


```bash
# Install the package
$ npm install --save @sweetalert2/sweetforms
```

```js
// Import the package to your project
import { SimpleForm, SteppedForm } from "@sweetalert2/sweetforms";

// Call one of the provided methods to generate your form.
// (See this example live below)
SimpleForm({
  themeConfig: {
    // [OPTION] Configure the popup's global appreaence
    darkMode: false,
    maxHeight: "65vh", // Max height of the inner form container
  },
  itemsByLine: 2, // [OPTION] Number of fields displayed for each line
  title: "Sign in", // Form title
  customValidators: {
    // Declare here your custom validation functions
    checkEmailAvailable: async ({ field, value, validate }) => {
      let isAvailable = true
      // ... Do some stuff here
      if (isAvailable) validate({ isValid: true });
      else
        validate({
          isValid: false, // [REQUIRED]
          message: `This email address is not available`, // [REQUIRED if not valid] Displayed err message
          force: true, // [OPTION] Overrides other validators messages
        });
    },
  },
  fields: [
    {
      label: "Email address", // [REQUIRED] Field label
      key: "email", // [REQUIRED] Key of the field value in the returned object
      type: "text", // [REQUIRED] Field type (See availables types above)
      value: "", // [REQUIRED] Field value
      placeholder: "john.doe@mail.com", // [OPTION] Placeholder value
      validation: ["required", "email"], // [OPTION] field validators (Among included ones in package)
      customValidation: ["checkEmailAvailable"], // [OPTION] custom field validator (Validator function must be declared on customValidators object above)
      fullWidth: true, // [OPTION] Field will take the full line whatever items per line has been specified
    },
    {
      confirmPassword: true, // On password type field, if option confirmPassword set to true, a "confirm password" field is auto-generated. It auto-includes matching & validation, so not necessary to add the 'required' validator
      label: "Password",
      key: "password",
      type: "password",
      value: "",
      placeholder: "••••••••••",
      validation: ["required"],
    },
    {
      label: "Country",
      key: "country",
      type: "select",
      value: "",
      options: [ // [REQUIRED for select / radio input]
        { label: "Select a country", value: "" },
        ...[
          "France",
          "Spain",
          "England",
          "Italy",
          "United States",
          "Canada",
          "Japan",
        ].map((opt) => {
          return { label: opt, value: opt.toLowerCase() };
        }),
      ],
      validation: ["required"],
    },
    {
      label: "Upload an avatar", // File input will return object, with base64 converted file, fileFormat and fileSize.
      type: "file",
      key: "avatar",
      value: "",
      validation: ["required"],
      attributes: { // [OPTION] Fields like range input, file input, ... have native attributes, such as files accepted, min / max / step for range, ... You can set these attributes using the attributes option.
        accept: "image/png, image/jpeg",
      },
    },
    {
      label: "Gender",
      type: "radio",
      key: "gender",
      validation: ["required"],
      options: [
        { label: "Male", value: "m" },
        { label: "Female", value: "f" },
      ],
      fullWidth: true,
    },
  ],
}).then((result) => {
  const { success, formData, ShowFeedback } = result;
  // ... Do some stuff here

  // ShowFeedback method allow you to display a feedback popup after processing the form content if needed
  ShowFeedback({
    success: true,
    title: "Form completed !",
    text: "",
    timer: 3000,
  });
});
```

## Documentation and live examples

- [SimpleForm example](https://stackblitz.com/edit/sweetforms-simple-example?file=src/App.vue)
- [SteppedForm example](https://stackblitz.com/edit/sweetforms-multi-steps-example?file=index.js),
- Online documentation: coming soon

## Improvements roadmap

- [x] Fix fields keys issue (URGENT)
- [x] Add support for password confirmation
- [ ] Webpack bundle + tailwind setup
- [ ] Tailwind-based css rework
- [ ] Add support for more data-forms
- [ ] Add input / output parsing module for fields values. (Handling of objects / array, multi-select checkboxes, ...)
- [ ] Add new input formats
- [ ] Add new default validators

## Credits

This package is entirely based on <a href="https://github.com/sweetalert2/sweetalert2" target="_blank">Sweetalert2</a>, and its promise-based notification system.

## You want to improve this library ? Or any ideas of improvements ?

This project is 100 % open-source, do not hesitate to give feedback on the library, ask for new features or even make a pull request. Any participation is welcomed.

## License

MIT

---

> GitHub [@ChronicStone](https://github.com/ChronicStone) &nbsp;&middot;&nbsp;
