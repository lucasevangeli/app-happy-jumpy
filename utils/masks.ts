// CPF/CNPJ Mask (handles both)
export const maskCPF_CNPJ = (value: string) => {
  value = value.replace(/\D/g, ''); // remove non-digits
  if (value.length <= 11) {
    // CPF
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
  } else {
    // CNPJ
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value.slice(0, 18); // Max length for CNPJ is 18 chars
};

// Phone Mask
export const maskPhone = (value: string) => {
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value.slice(0, 15); // (XX) XXXXX-XXXX
};

// CEP (Postal Code) Mask
export const maskCEP = (value: string) => {
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{5})(\d)/, '$1-$2');
  return value.slice(0, 9); // XXXXX-XXX
};

// Date Mask
export const maskDate = (value: string) => {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{2})(\d)/, '$1/$2');
  value = value.replace(/(\d{2})(\d)/, '$1/$2');
  return value.slice(0, 10); // DD/MM/YYYY
};

// CPF Display Mask (e.g., 123.***.***-**)
export const displayMaskCPF = (value: string) => {
  value = value.replace(/\D/g, '');
  if (value.length === 11) {
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
  }
  // If it's not a CPF, return as is or handle CNPJ if needed
  return value;
};
