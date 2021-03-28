export function onlyAlphabet (evt) {
  evt = (evt) || window.event;
  const charCode = (evt.which) ? evt.which : evt.keyCode;
  if (((charCode >= 65) && (charCode <= 122)) || (charCode === 45) || (charCode === 13)) {
    return true;
  }
  evt.preventDefault();
}

export function onlyNumbers (evt) {
  evt = (evt) || window.event;
  const charCode = (evt.which) ? evt.which : evt.keyCode;
  if (((charCode >= 48) && (charCode <= 57)) || (charCode === 45) || (charCode === 13)) {
    return true;
  }
  evt.preventDefault();
}

export function capitalizeFirstLetter (event, isWord = false) {
  let word = isWord ? event : event.target.value;
  word = word.trim();
  word = word.charAt(0).toUpperCase() + word.slice(1);
  return word;
}
