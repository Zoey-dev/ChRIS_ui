import React from 'react'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import { useHistory } from "react-router-dom";
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Checkbox,
  ActionGroup,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import ChrisApiClient from "@fnndsc/chrisapi";
import { Link } from "react-router-dom";
import { has } from "lodash";
import { validate } from "email-validator";
import {setAuthToken} from '../../../store/user/actions'


type Validated = {
  error: undefined | "error" | "default" | "success" | "warning";
};

interface SignUpFormProps {
  setAuthToken: (auth: { token: string; username: string }) => void;
};



const SignUpForm: React.FC<SignUpFormProps> = ({
  setAuthToken,
}: SignUpFormProps) => {
  const [userState, setUserState] = React.useState<{
    username: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    username: "",
    validated: "default",
    invalidText: "",
  });
  const [emailState, setEmailState] = React.useState<{
    email: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    email: "",
    validated: "default",
    invalidText: "",
  });
  const [passwordState, setPasswordState] = React.useState<{
    password: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    password: "",
    validated: "default",
    invalidText: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const history = useHistory();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userState.username) {
      setUserState({
        ...userState,
        validated: "error",
        invalidText: "Username is required",
      });
    }

    if (!emailState.email || !validate(emailState.email)) {
      setEmailState({
        ...emailState,
        validated: "error",
        invalidText: "Email is Required",
      });
    }

    if (!passwordState.password) {
      setPasswordState({
        ...passwordState,
        validated: "error",
        invalidText: "Password is Required",
      });
    }

    setLoading(true);
    const userURL = process.env.REACT_APP_CHRIS_UI_USERS_URL;
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    let user;
    let token;

    if (userURL) {
      try {
        user = await ChrisApiClient.createUser(
          userURL,
          userState.username,
          passwordState.password,
          emailState.email
        );

        token = await ChrisApiClient.getAuthToken(
          authURL,
          userState.username,
          passwordState.password
        );
      } catch (error) {
        if (has(error, "response")) {
          if (has(error, "response.data.username")) {
            setLoading(false);
            setUserState({
              ...userState,
              invalidText: "This username is already registered",
              validated: "error",
            });
          }

          if (has(error, "response.data.email")) {
            setLoading(false);
            setEmailState({
              ...emailState,
              invalidText: "This email address already exists",
              validated: "error",
            });
          }

          if (has(error, "response.data.password")) {
            setLoading(false);
            setPasswordState({
              ...passwordState,
              invalidText: "Password should be at least 8 characters",
              validated: "error",
            });
          }
        } else {
          setLoading(false);
        }
      }
    }

    if (user && token) {
      setAuthToken({
        token,
        username: user.data.username,
      });
      history.push("/");
    }
  };

  const handleShowPassword = (checked: boolean) => {
    setShowPassword(checked);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <FormGroup
        label="Username"
        isRequired
        fieldId="username"
        helperTextInvalidIcon={<ExclamationCircleIcon />}
        helperTextInvalid={userState.invalidText}
        validated={userState.validated}
      >
        <TextInput
          validated={userState.validated}
          value={userState.username}
          isRequired
          type="text"
          id="chris-username"
          aria-describedby="username helper"
          name="username"
          onChange={(value: string) =>
            setUserState({
              invalidText: "",
              validated: "default",
              username: value,
            })
          }
        ></TextInput>
      </FormGroup>

      <FormGroup
        label="Email"
        isRequired
        fieldId="
            email"
        helperTextInvalidIcon={<ExclamationCircleIcon />}
        helperTextInvalid={emailState.invalidText}
        validated={emailState.validated}
      >
        <TextInput
          validated={emailState.validated}
          value={emailState.email}
          isRequired
          type="email"
          id="chris-email"
          name="email"
          onChange={(value: string) =>
            setEmailState({
              invalidText: "",
              validated: "default",
              email: value,
            })
          }
        />
      </FormGroup>

      <FormGroup
        label="Password"
        isRequired
        fieldId="password"
        helperText="Password should have at least 8 characters"
        helperTextInvalidIcon={<ExclamationCircleIcon />}
        helperTextInvalid={passwordState.invalidText}
        validated={passwordState.validated}
      >
        <TextInput
          validated={passwordState.validated}
          value={passwordState.password}
          isRequired
          type={showPassword ? "text" : "password"}
          id="chris-password"
          name="password"
          onChange={(value: string) =>
            setPasswordState({
              invalidText: "",
              validated: "default",
              password: value,
            })
          }
          style = {{
            marginBottom:"1rem"
          }}
        />
        <Checkbox
          isChecked={showPassword}
          label="Show password"
          aria-label="Show password"
          id="showPassword"
          onChange={handleShowPassword}
        />
       
      </FormGroup>
      

      <ActionGroup>
        <Button variant="primary" type="submit">
          {loading ? "Loading...." : "Create Account"}
        </Button>
        <Link to="/login">Already have an account?</Link>
      </ActionGroup>
    </Form>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthToken: (auth: { token: string; username: string }) =>
    dispatch(setAuthToken(auth)),
});


export default connect(null, mapDispatchToProps)(SignUpForm);
