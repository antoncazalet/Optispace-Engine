import { Box } from "@mui/system";
import React from "react";
import { useLang } from "../../Context/LangProvider";
import CustomStepper from "../Stepper/Stepper";
import StepGetProjectSpecs from "./StepGetProjectSpecs";
import StepUploadPlanOrPlaceholder from "./StepUploadPlanOrPlaceholder";
import StepWelcome from "./StepWelcome";

interface Props {
    onFinish: () => void;
}

const WelcomeCenter: React.FC<Props> = (props: Props) => {
    const { translate } = useLang();

    return (
        <Box>
            <CustomStepper
                enableFinishButton={true}
                steps={[
                    {
                        title: translate("WELCOME_CENTER.WELCOME_TAB.TAB_TITLE"),
                        content: <StepWelcome />,
                    },
                    /*
                    {
                        title: translate("WELCOME_CENTER.GET_INFOS.TAB_TITLE"),
                        content: <StepGetInfos />,
                    },
                    */
                    {
                        title: translate("WELCOME_CENTER.GET_SPECS_INFOS.TAB_TITLE"),
                        content: <StepGetProjectSpecs />,
                    },
                    {
                        title: translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.TAB_TITLE"),
                        content: <StepUploadPlanOrPlaceholder onFinish={props.onFinish} />,
                    },
                ]}
                onFinish={props.onFinish}
            />
        </Box>
    );
};

export default WelcomeCenter;
