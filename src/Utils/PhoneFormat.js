const formatPhoneNumber = input => {
	const regExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
	if (input) {
		return String(input).replace(regExp, "($1) $2-$3");
	} else {
		return "";
	}
};
export default formatPhoneNumber;
