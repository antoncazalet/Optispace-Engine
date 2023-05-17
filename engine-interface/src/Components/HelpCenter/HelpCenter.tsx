import { ArrowForwardIosSharp, QuestionAnswer } from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    FormControl,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { useLang } from "../../Context/LangProvider";

const HelpCenter: React.FC = () => {
    const { translate } = useLang();
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(-1);

    const [indexes, setIndexes] = React.useState<number[]>([]);
    const [search, setSearch] = React.useState("");

    const questions = Object.values(translate("HELP_CENTER_TAB.QUESTIONS")) as unknown as Array<{
        QUESTION: string;
        ANSWER: string;
    }>;

    const handleQuestionChange = (index: number) => {
        if (index === currentQuestionIndex) {
            setCurrentQuestionIndex(-1);
        } else {
            setCurrentQuestionIndex(index);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        const search = event.target.value.toLowerCase();
        const indexes: number[] = [];

        questions.forEach((question, index) => {
            if (question.QUESTION.toLowerCase().includes(search) || question.ANSWER.toLowerCase().includes(search)) {
                indexes.push(index);
            }
        });
        setIndexes(indexes);
    };

    return (
        <Box>
            <Box>
                <FormControl sx={{ width: "95%", mr: "auto", ml: "auto", display: "flex", mt: 1 }} variant="outlined">
                    <TextField
                        fullWidth
                        id="ask-a-question"
                        label={translate("HELP_CENTER_TAB.TITLE")}
                        onChange={handleSearch}
                    />
                </FormControl>
            </Box>
            <Box component="hr" />
            <Box>
                {search.length > 0 && indexes.length === 0 && (
                    <Alert
                        severity="info"
                        sx={{ mx: 1 }}
                        action={
                            <IconButton
                                onClick={() =>
                                    window.open(
                                        `https://airtable.com/shrtpJahmDW4GeePD?prefill_Quelle%20est%20votre%20question%20%3F=${search}`,
                                        "_blank"
                                    )
                                }
                            >
                                <QuestionAnswer />
                            </IconButton>
                        }
                    >
                        {translate("HELP_CENTER_TAB.NO_RESULT")}
                    </Alert>
                )}
                {questions.map((question, index) => {
                    if (!indexes.includes(index) && search.length > 0) {
                        return null;
                    }
                    return (
                        <Box key={index} sx={{ pt: 2 }}>
                            <Accordion
                                expanded={index === currentQuestionIndex}
                                onChange={() => handleQuestionChange(index)}
                                disableGutters
                                elevation={0}
                                square
                                sx={{
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    "&:not(:last-child)": {
                                        borderBottom: 0,
                                    },
                                    "&:before": {
                                        display: "none",
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
                                    sx={{
                                        backgroundColor: "rgba(255, 255, 255, .05)",
                                        flexDirection: "row-reverse",
                                        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                                            transform: "rotate(90deg)",
                                        },
                                        "& .MuiAccordionSummary-content": {
                                            marginLeft: 1,
                                        },
                                    }}
                                >
                                    <Typography>{question.QUESTION}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ padding: 2, borderTop: "1px solid rgba(0, 0, 0, .125)" }}>
                                    <Typography>{question.ANSWER}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default HelpCenter;
