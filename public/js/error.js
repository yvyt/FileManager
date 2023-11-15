export const hideError = (type) => {
  const container = document.querySelector(`.container-error__${type}`);
  container.innerHTML = "";
};

export const showError = (type, msg) => {
  const container = document.querySelector(`.container-error__${type}`);
  const markup = `<div class="alert alert-danger">${msg}</div>`;
  hideError(type);

  container.insertAdjacentHTML("afterbegin", markup);
};
