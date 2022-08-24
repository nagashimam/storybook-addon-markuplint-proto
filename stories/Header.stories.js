import React from "react";

import { Header } from "./Header";

export default {
  title: "Example/Header",
  component: Header,
};

const Template = (args) => <Header {...args} />;

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  onLogin: () => {
    console.log("login");
  },
  onLogout: () => {
    console.log("logout");
  },
  onCreateAccount: () => {
    console.log("account created");
  },
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  user: {},
  ...LoggedOut.args,
};
