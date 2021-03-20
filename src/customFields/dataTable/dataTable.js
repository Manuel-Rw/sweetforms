import {
  getFieldValue,
  getFieldErrDOM,
  appendErrMessage,
  removeErrMessage,
  getErrMessageText,
  regexRules,
} from "../../helpers/index.js";

export const initDataTable = async ({ field }) => {
  const headCols = field.columns.map((col) =>
    document.getElementById(`${field.key}__headerCol__${col.key}`)
  );

  // SETUP PAGINATION (TO DO)

  // const nextPage = `${field.key}__dataTablePaginationNext`
  // const nextPage = `${field.key}__dataTablePaginationPrev`
  // const updatePaginationState = ({totalRows, }) => {

  // }

  // nextPage.addEventListener('click', () => {

  // })

  // prevPage.addEventListener('click', () => {

  // })

  // Const checkbox select
  const selectedNb = document.getElementById(
    `${field.key}__dataTableSelectedNb`
  );
  const globalCheckbox = document.getElementById(
    `${field.key}__tableGlobalSelector`
  );
  const checkboxes = document.querySelectorAll(
    `#${field.key}__formDataSelectRow`
  );

  var lastChecked = null;

  globalCheckbox.addEventListener("change", async () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = globalCheckbox.checked;
      if (globalCheckbox.checked) {
        checkbox.parentElement.parentElement.classList.add("selectedRow");
        // selectedNb.innerHTML = Number(selectedNb.innerHTML) + 1
      } else if (
        checkbox.parentElement.parentElement.classList.contains("selectedRow")
      ) {
        checkbox.parentElement.parentElement.classList.remove("selectedRow");
        // selectedNb.innerHTML = Number(selectedNb.innerHTML) - 1
      }
    });

    const selected = await getFieldValue({ field });
    selectedNb.innerHTML = selected.length;
  });
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", (e) => {
      let inBetween = false;
      if (e.shiftKey) {
        checkboxes.forEach((checkbox) => {
          if (checkbox === e.target || checkbox === lastChecked) {
            inBetween = !inBetween;
          }
          if (inBetween) {
            checkbox.checked = e.target.checked;
            if (!e.target.checked)
              checkbox.parentElement.parentElement.classList.remove(
                "selectedRow"
              );
            else
              checkbox.parentElement.parentElement.classList.add("selectedRow");
          }
        });
      }
      lastChecked = e.target;
    });
    checkbox.addEventListener("change", async (e) => {
      const row = checkbox.parentElement.parentElement;
      if (checkbox.checked) row.classList.add("selectedRow");
      else row.classList.remove("selectedRow");
      const selected = await getFieldValue({ field });
      selectedNb.innerHTML = selected.length;
    });
  });

  // ## SEARCH INPUT
  const searchInput = document.getElementById(`${field.key}__search__input`);
  searchInput.addEventListener("keyup", (e) => {
    const val = e.target.value;
    let elements = Array.prototype.slice.call(
      document.querySelectorAll(`.${field.key}__row_item`)
    );
    elements.forEach((row) => {
      if (!val) {
        row.classList.remove("hideRow");
        return;
      }
      let [rowVal, showRow] = [
        JSON.parse(row.getAttribute("row-value").replaceAll(`'`, `"`)),
        false,
      ];
      Object.keys(rowVal).forEach((key) => {
        if (
          rowVal[key]
            .toString()
            .toLowerCase()
            .indexOf(val.toString().toLowerCase()) !== -1
        )
          showRow = true;
      });

      if (!showRow) row.classList.add("hideRow");
      else row.classList.remove("hideRow");
    });
  });

  // ## SORT BY COLUMNS

  headCols.forEach((column) => {
    column.addEventListener("click", (e) => {
      if (column.getAttribute("sort") == "") column.setAttribute("sort", "asc");
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
        const [aObj, bObj] = [
          JSON.parse(a.getAttribute("row-value").replaceAll(`'`, `"`)),
          JSON.parse(b.getAttribute("row-value").replaceAll(`'`, `"`)),
        ];

        if (aObj[sortKey] > bObj[sortKey]) {
          return sortMode == "asc" ? 1 : -1;
        } else if (bObj[sortKey] > aObj[sortKey]) {
          return sortMode == "asc" ? -1 : 1;
        } else {
          return 0;
        }
      });

      elements.forEach((item, index) => {
        if (index > 0) item.parentNode.insertBefore(item, elements[index - 1]);
        item.classList.add("sorting");
        // and remove 'faded-out' in order to fade-in our element
        requestAnimationFrame(() => {
          item.classList.remove("sorting");
        });
      });
    });
  });
};
