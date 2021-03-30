export function onlyNumbers (evt) {
  evt = (evt) || window.event;
  const charCode = (evt.which) ? evt.which : evt.keyCode;
  if (((charCode >= 48) && (charCode <= 57)) || (charCode === 45) || (charCode === 13)) {
    return true;
  }
  evt.preventDefault();
}
