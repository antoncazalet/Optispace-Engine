import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useLang } from "../../Context/LangProvider";

interface Step {
    title: string;
    content: React.ReactNode;
    optional?: boolean;
}

interface Props {
    steps: Array<Step>;

    onFinish?: () => void;

    enableBack?: boolean;
    enableFinishButton?: boolean;
}

const CustomStepper = (props: Props) => {
    const { steps, enableBack } = props;
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const { translate } = useLang();

    const isStepOptional = (step: Step) => {
        return step.optional === true;
    };

    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(steps[activeStep])) {
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    React.useEffect(() => {
        if (activeStep === steps.length) {
            if (props.onFinish) {
                props.onFinish();
            }
        }
    }, [activeStep]);

    const currentStep = steps[activeStep];

    return (
        <Box sx={{ width: "100%" }}>
            {activeStep === steps.length ? (
                <React.Fragment></React.Fragment>
            ) : (
                <React.Fragment>
                    <Typography variant="h5" sx={{ textAlign: "center" }}>
                        {currentStep.title}
                    </Typography>
                    <Box component="hr" />
                    <Box sx={{ textAlign: "center", pt: 2 }}>{currentStep.content}</Box>
                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                        {enableBack && (
                            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                                {translate("STEPPER.PREVIOUS")}
                            </Button>
                        )}
                        <Box sx={{ flex: "1 1 auto" }} />
                        {isStepOptional(steps[activeStep]) && (
                            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                                {translate("STEPPER.SKIP")}
                            </Button>
                        )}
                        {activeStep === steps.length - 1 && props.enableFinishButton && (
                            <Button disabled onClick={handleNext}>
                                {translate("STEPPER.FINISH")}
                            </Button>
                        )}
                        {activeStep !== steps.length - 1 && (
                            <Button variant="contained" onClick={handleNext}>
                                {translate("STEPPER.NEXT")}
                            </Button>
                        )}
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
};

export default CustomStepper;
