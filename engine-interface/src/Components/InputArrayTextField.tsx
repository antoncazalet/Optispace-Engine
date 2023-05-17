import { Autocomplete, Chip, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import React from "react";

interface Props {
    initialValues: string[];

    label: string;

    onChange: (values: string[]) => void;
}

const InputArrayTextField = (props: Props) => {
    const { initialValues, onChange, label } = props;

    const [values, setValue] = React.useState<string[]>(initialValues ?? []);

    React.useEffect(() => {
        if (initialValues !== values) {
            setValue(initialValues);
        }
    }, [initialValues]);

    return (
        <Autocomplete
            fullWidth
            multiple
            value={values}
            onChange={(_, newValue) => {
                if (newValue[newValue.length - 1]?.includes("Ajouter")) {
                    const lastValue = newValue.pop();

                    if (!lastValue) {
                        return;
                    }

                    const formattedLastValue = lastValue.substring(
                        lastValue.indexOf('"') + 1,
                        lastValue.lastIndexOf('"')
                    );
                    newValue.push(formattedLastValue);
                }
                setValue(newValue);
                onChange(newValue);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const target = e.target as HTMLInputElement;

                if (e.code === "Enter" && target.value) {
                    e.preventDefault();
                    if (target.value[0] !== "#") {
                        target.value = `#${target.value}`;
                    }
                    setValue([...values, target.value]);
                    onChange([...values, target.value]);
                }
            }}
            filterOptions={(options, params) => {
                const filter = createFilterOptions<string>();
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== "" && !isExisting) {
                    filtered.push(`Ajouter "#${inputValue}"`);
                }

                return filtered as string[];
            }}
            noOptionsText="Pas d'options"
            options={values}
            getOptionLabel={(option) => option}
            renderTags={(tagValue, getTagProps) =>
                // eslint-disable-next-line react/jsx-key
                tagValue.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
            }
            renderInput={(params) => <TextField {...params} label={label} />}
        />
    );
};

export default InputArrayTextField;
