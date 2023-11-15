import axios from "axios";
import { hideError, showError } from "./error";
import * as Management from "./management";

const signupForm = document.querySelector(".form--signup");
const forgotPasswordForm = document.querySelector(".form--forgotpassword");
const resetPasswordForm = document.querySelector(".form--resetpassword");
const signupBtn = document.querySelector(".input-submit__signup");
const logoutBtn = document.querySelector(".nav__logout");

// Admin pages
// const pagination = document.querySelector(".user .pagination");
const pagination = document.querySelector(".pagination");
const userContainer = document.querySelector(".container--user-list");
const reportContainer = document.querySelector(".file-library .col-lg-12");
const searchBar = document.querySelector(".input-navbar");
const btnDelete = document.querySelector(".delete");

if (reportContainer) {
  Management.renderReports();
  reportContainer.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    const warnBtn = e.target.closest(".warn-btn");
    const card = e.target.closest(".item");
    const reportId = card.dataset.id;
    if (deleteBtn) {
      await Management.deleteOne(reportId, "report");
      // const currPage = e.target.closest(".page-item .active").dataset.page * 1;
      const currPage =
        document.querySelector(".page-item.active").dataset.page * 1;
      Management.renderReports();
    }
    if (warnBtn) {
      Management.sendWarningMail(reportId);
    }
  });
}
// User Management
if (userContainer) {
  Management.renderUsers();
  userContainer.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete");
    if (deleteBtn) {
      const card = e.target.closest(".card");
      const userId = card.dataset.id;
      await Management.deleteOne(userId, "user");
      // const currPage = e.target.closest(".page-item .active").dataset.page * 1;
      const currPage =
        document.querySelector(".page-item.active").dataset.page * 1;
      Management.renderUsers(currPage);
    }
  });
}

if (searchBar) {
  searchBar.addEventListener("keyup", () => {
    Management.renderUsers();
  });
}

if (pagination) {
  pagination.addEventListener("click", (e) => {
    const pageBtn = e.target.closest(".page-item");
    pageBtn.classList.add(".active");
    const page = pageBtn.dataset.page * 1;
    Management.renderUsers(page);
    Management.renderReports(page);
  });
}

// Authentication

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "api/users/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === "success") {
      signupBtn.value = "Your account has been created!";
      window.setTimeout(() => {
        window.location.reload(true);
        return false;
      }, 2500);
    }
  } catch (err) {
    showError("signup", err.response.data.msg);
    signupBtn.value = "Sign up";
  }
};

const sendResetPasswordToken = async (email) => {
  try {
    const res = await axios({
      method: "POST",
      url: "api/users/forgotPassword",
      data: { email },
    });
    if (res.data.status === "success") {
      alert("Password reset link has been sent to your email");
      document.getElementById("btn-submit").innerText = "Confirm";
    }
  } catch (err) {
    document.getElementById("btn-submit").innerText = "Confirm";
    showError("forgotpassword", err.response.data.msg);
  }
};

const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `api/users/resetPassword?token=${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === "success") {
      alert("Password changed successfully");
      document.getElementById("btn-submit").innerText = "Confirm";
      window.setTimeout(() => {
        location.assign("/login");
        return false;
      }, 1500);
    }
  } catch (err) {
    document.getElementById("btn-submit").innerText = "Confirm";
    showError("resetpassword", err.response.data.msg);
  }
};

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.querySelector(".email-signup").value;
    const password = document.querySelector(".password-signup").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    signupBtn.value = "Signing you up...";
    signup(name, email, password, passwordConfirm);
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError("forgotpassword");
    const email = document.getElementById("emailForm").value;
    document.getElementById("btn-submit").innerText = "Sending email...";
    sendResetPasswordToken(email);
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError("resetpassword");
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    const token = document.getElementById("token").value;
    document.getElementById("btn-submit").innerText = "Loading...";
    resetPassword(password, passwordConfirm, token);
  });
}

// const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: "POST",
//       url: "http://127.0.0.1:3000/api/users/login",
//       data: {
//         email,
//         password,
//       },
//     });
//     if (res.data.status === "success") {
//       window.setTimeout(() => {
//         location.assign("/");
//       }, 500);
//     }
//   } catch (err) {
//     showError("login", err.response.data.msg);
//     loginBtn.value = "Log in";
//   }
// };
// const logout = async () => {
//   try {
//     const res = await axios({
//       method: "GET",
//       url: "http://127.0.0.1:3000/api/users/logout",
//     });
//     if (res.data.status === "success") {
//       window.setTimeout(() => {
//         location.assign("/login");
//       }, 500);
//     }
//     return false;
//   } catch (err) {}
// };

// if (loginForm) {
//   loginForm.addEventListener("submit", (e) => {
//     e.preventDefault();
//     const email = document.querySelector(".email-login").value;
//     const password = document.querySelector(".password-login").value;
//     loginBtn.value = "Logging in...";
//     login(email, password);
//   });
// }

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", logout);
// }
