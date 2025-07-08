const formatPhoneNumber = (input: string): string => {
  const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (input) {
    return (
      input.replace(regExp, '($1) $2-$3')
    );
  } else {
    return '';
  }
};

export default formatPhoneNumber; 