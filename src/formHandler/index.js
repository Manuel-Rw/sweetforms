import { mapFieldAttributes, getFieldValue } from "../helpers/index.js";
import {
  requiredValidator,
  emailValidator,
  confirmPasswordValidator,
  customValidator,
  fileValidator,
} from "../validators/index.js";

// Finishing the form setup on render
export const formDidRender = ({ fields }) => {
  const inputs = document.querySelectorAll(
    fields.map((field) => `#--swInput${field.key}--`)
  );
  inputs.forEach((input) => {
    let field = fields.find((field) =>
      input.id.includes(`--swInput${field.key}--`)
    );
    if (field.attributes && mapFieldAttributes({ field }))
      mapFieldAttributes({ field }).forEach((attr) =>
        input.setAttribute(attr.key, attr.value)
      );
    if (document.getElementById(`swRangeVal${field.key}`))
      document.getElementById(
        `swRangeVal${field.key}`
      ).innerHTML = document.getElementById(`--swInput${field.key}--`).value;
    input.addEventListener("focusin", () => input.classList.add("swFocus"));
    input.addEventListener("focusout", () => input.classList.remove("swFocus"));

    if (field.type == "password" && field.confirmPassword) {
      const confirmPassInput = document.getElementById(
        `--swInput${field.key}--confirm--`
      );
      confirmPassInput.addEventListener("focusin", () =>
        confirmPassInput.classList.add("swFocus")
      );
      confirmPassInput.addEventListener("focusout", () =>
        confirmPassInput.classList.remove("swFocus")
      );
    }

    if (field.type == "data-table") {
      console.log("## DATA-TABLE-INIT");
      const headCols = field.columns.map((col) =>
        document.getElementById(`${field.key}__headerCol__${col.key}`)
      );

      // Const checkbox select 
      const fieldElement = document.getElementById('')
      const globalCheckbox = document.getElementById(`${field.key}__tableGlobalSelector`)
      const checkboxes = document.querySelectorAll(`#${field.key}__formDataSelectRow`)
      globalCheckbox.addEventListener('change', () => {
        checkboxes.forEach(checkbox =>  {
          checkbox.checked = globalCheckbox.checked
          if(globalCheckbox.checked) checkbox.parentElement.parentElement.classList.add('selectedRow')
          else checkbox.parentElement.parentElement.classList.remove('selectedRow')
        })
      })
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const row = checkbox.parentElement.parentElement
          if(checkbox.checked) row.classList.add('selectedRow')
          else row.classList.remove('selectedRow')
          console.log({row})
        })
      })
      console.log({checkboxes})

      // ## SEARCH INPUT
      const searchInput = document.getElementById(`${field.key}__search__input`)
      searchInput.addEventListener('keyup', (e) => {
        const val = e.target.value
        let elements = Array.prototype.slice.call(
          document.querySelectorAll(`.${field.key}__row_item`)
        );
        elements.forEach((row) => {
          if(!val) {
            row.classList.remove('hideRow')
            return
          }
          let [rowVal, showRow] = [JSON.parse(row.getAttribute('row-value').replaceAll(`'`, `"`)), false]
          Object.keys(rowVal).forEach(key => {
            if(rowVal[key].toLowerCase().indexOf(val.toLowerCase()) !== -1) showRow = true
          })

          if(!showRow) row.classList.add('hideRow')
          else row.classList.remove('hideRow')
        })
      })
      

      // ## SORT BY COLUMNS
      
      headCols.forEach((column) => {
        column.addEventListener("click", (e) => {
          if (column.getAttribute("sort") == "")
            column.setAttribute("sort", "asc");
          else if (column.getAttribute("sort") == "asc")
            column.setAttribute("sort", "desc");
          else if (column.getAttribute("sort") == "desc")
            column.setAttribute("sort", "asc");

          const sortMode = column.getAttribute("sort");
          const sortKey = column.getAttribute("column-key");
          let elements = Array.prototype.slice.call(
            document.querySelectorAll(`.${field.key}__row_item`)
          );

          elements.sort((a, b) => {
            const [aObj, bObj] = [JSON.parse(a.getAttribute('row-value').replaceAll(`'`, `"`)), JSON.parse(b.getAttribute('row-value').replaceAll(`'`, `"`))]

            if (aObj[sortKey] > bObj[sortKey]) {
                return sortMode == 'asc' ? 1 : -1;
              } else if (bObj[sortKey] > aObj[sortKey]) {
                return sortMode == 'asc' ? -1 : 1
              } else {
                return 0;
              }
          });

          elements.forEach((item, index) => {
            if (index > 0) item.parentNode.insertBefore(item, elements[index - 1]);
            item.classList.add("sorting")
            // and remove 'faded-out' in order to fade-in our element
            requestAnimationFrame(() => {
                item.classList.remove("sorting")
            })
          });
        });
      });
    }
  });
};

// Handling differents inputs event listeners / fields reactive validation
export const formDidOpen = async ({ fields, customValidators }) => {
  const inputs = document.querySelectorAll(
    fields.map((field) => `#--swInput${field.key}--`)
  );
  inputs.forEach((input) => {
    console.log({ inputId: input.id });
    let field = fields.find((field) =>
      input.id.includes(`--swInput${field.key}--`)
    );
    if (
      [
        "date",
        "datetime-local",
        "time",
        "month",
        "week",
        "file",
        "checkbox",
        "radio",
        "select",
      ].includes(field.type)
    ) {
      input.addEventListener("change", async () => {
        if (field.validation && field.validation.includes("required"))
          requiredValidator({ field });
        if (field.type === "file") fileValidator({ field });
        if (field.customValidation && customValidators)
          customValidator({ field, customValidators });
      });
    } else {
      input.addEventListener("keyup", async () => {
        if (field.validation && field.validation.includes("required"))
          requiredValidator({ field });
        if (field.validation && field.validation.includes("email"))
          emailValidator({ field });
        if (field.customValidation && customValidators)
          customValidator({ field, customValidators });
        if (field.type == "password" && field.confirmPassword)
          confirmPasswordValidator({ field });
      });
    }

    if (field.type == "password" && field.confirmPassword) {
      document
        .getElementById(`--swInput${field.key}--confirm--`)
        .addEventListener("keyup", (async) => {
          confirmPasswordValidator({ field });
        });
    }
  });
};

// Check form / step before submit / next step
export const formPreCheck = async ({ fields, customValidators }) => {
  return Promise.all(
    fields.map((field) => {
      return new Promise(async (resolve) => {
        const input = document.getElementById(`--swInput${field.key}--`);
        let fieldRes = {
          fieldKey: field.key,
          value: await getFieldValue({ field, input }),
          isValid: true,
          errors: [],
        };
        const setError = (err) =>
          ([fieldRes.errors, fieldRes.isValid] = [
            [...fieldRes.errors, err],
            false,
          ]);

        const validationPromises = [];
        if (field.validation && field.validation.includes("required"))
          validationPromises.push(
            new Promise((resolve) => requiredValidator({ field, resolve }))
          );
        if (field.validation && field.validation.includes("email"))
          validationPromises.push(
            new Promise((resolve) => emailValidator({ field, resolve }))
          );
        if (field.type === "file")
          validationPromises.push(
            new Promise((resolve) => fileValidator({ field, resolve }))
          );
        if (field.customValidation && customValidators)
          validationPromises.push(
            new Promise((resolve) =>
              customValidator({ field, customValidators, resolve })
            )
          );
        if (field.type == "password" && field.confirmPassword)
          confirmPasswordValidator({ field, resolve });

        if (validationPromises) {
          Promise.all(validationPromises).then((validationRes) => {
            validationRes.forEach((res) => {
              if (!res.isValid) setError(res.errKey);
            });
            resolve(fieldRes);
          });
        } else resolve(fieldRes);
      });
    })
  );
};
