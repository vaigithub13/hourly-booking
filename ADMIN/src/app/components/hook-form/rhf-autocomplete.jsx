import PropTypes from "prop-types";
import { Controller, useFormContext } from "react-hook-form";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState } from "react";
// import { getRequest } from 'app/utils/request'
import { useRouter } from "app/hooks/useRouter";
import { getRequest } from "app/utils/request";

// ----------------------------------------------------------------------

export default function RHFAutocomplete({
  name,
  label,
  type,
  url,
  filter,
  helperText,
  placeholder,
  ...other
}) {
  const { control, setValue } = useFormContext();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  // Fetch options based on input
  const fetchOptions = async (inputValue) => {
    setLoading(true);
    console.log("=======reached");
    const response = await getRequest(`${url}&${filter}=${inputValue}`, router);
    setOptions(filter === "name" ? response?.data?.products : response?.data?.rows || []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length > 0) {
        fetchOptions(inputValue);
      } else {
        setOptions([]);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const { multiple } = other;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <Autocomplete
            {...field}
            id={`autocomplete-${name}`}
            value={field?.value || null}
            filterOptions={(x) => x}
            options={options}
            loading={loading}
            noOptionsText="No Results"
            onChange={(event, newValue) => {
              setValue(name, newValue, { shouldValidate: true });
              setInputValue("");
            }}
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error?.message : helperText}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "off"
                }}
              />
            )}
            {...other}
          />
        );
      }}
    />
  );
}

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
  placeholder: PropTypes.string
};

// ----------------------------------------------------------------------
