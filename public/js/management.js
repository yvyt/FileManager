import axios from "axios";
import moment from "moment";

export const deleteOne = async (id, type) => {
  const res = await axios({
    method: "DELETE",
    url: `api/${type}s/${id}`,
    data: {},
  });
  console.log(`${type} has been deleted`);
};

const renderPageBtn = (page, symbol) => {
  const a = symbol ? symbol : page;
  const markup = `
  <li class="page-item" data-page="${page}"><a class="page-link" href="#">${
    symbol ? symbol : page
  }</a></li>
  `;
  return markup;
};

export const renderPagination = (totalPages, currPage) => {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  let markup = "";
  if (currPage > 1) {
    markup += renderPageBtn(1, "&laquo");
  }
  let start = currPage - 1 > 0 ? currPage - 1 : currPage;
  let i;
  for (i = start; i <= currPage + 1 && i <= totalPages; i++) {
    markup += renderPageBtn(i);
  }
  if (i - 1 != totalPages) {
    markup += renderPageBtn(totalPages, "&raquo");
  }
  pagination.insertAdjacentHTML("afterbegin", markup);
};

const highlightSelected = (page) => {
  const pageBtnsArr = Array.from(document.querySelectorAll(".page-item"));
  pageBtnsArr.forEach((el) => {
    el.classList.remove("active");
  });
  document
    .querySelector(`.page-item[data-page="${page}"]`)
    .classList.add("active");
};

const limitString = (string, limit) => {
  if (string.length > limit) return string.substring(0, limit) + "...";
  return string;
};

const getReportContent = (type) => {
  const reportContent = {
    0: "Spam Content",
    1: "Malware",
    2: "Phishing",
    3: "Violence",
    4: "Hate Speech",
    5: "Violent Organizations and Movements Content",
    6: "Harassment, Bullying, and Threats",
    7: "Sexually Explicit Material",
    8: "Impersonation and Misrepresentation",
    9: "Personal and Confidential Information",
    10: "Illegal Activities",
    11: "Copyright Infringement",
  };
  return limitString(reportContent[type * 1], 15);
};

const displaySize = (size) => {
  return Math.floor(size / 1024 / 1024);
};

const renderReport = (file, report) => {
  const markup = `
    <div class="item" data-id=${report._id}>
      <ul>
        <li><img
            src="./../images/file.png"
            alt=""
            class="templatemo-item"
          />
        </li>
        <li><h4><a href="#">${limitString(file.name, 10)}</a>
        </h4> <span>Detail</span></li>
        <li><h4>Ngày báo cáo</h4><span>${moment(report.modify).format(
          "DD/MM/YYYY"
        )}</span></li>
        <li><h4>Nội dung</h4><span>${getReportContent(report.type)}</span></li>
        <li><div class="main-border-button warn-btn"><a href="#">Cảnh báo</a></div></li>
        <li><div class="main-border-button delete-btn"><a href="#">Xóa File</a></div></li>
        <li></li>
        <!-- <li><img src="images/iconTrash.png" alt="" class="templatemo-item"></li> -->
      </ul>
    </div>
  `;
  const parent = document.querySelector(".file-library .col-lg-12");
  parent.insertAdjacentHTML("beforeend", markup);
};

export const renderReports = async (currPage) => {
  const page = currPage || 1;
  const limit = 5;
  const parent = document.querySelector(".file-library .col-lg-12");
  parent.innerHTML = "";
  try {
    const res = await axios({
      method: "GET",
      url: `api/reports/?page=${page}&limit=${limit}`,
      data: {
        reports,
      },
    });
    const reports = res.data.data.reports;
    reports.forEach((curr) => {
      renderReport(curr.fileId, curr);
    });
    renderPagination(res.data.totalPages, page);
    highlightSelected(page);
  } catch (err) {
    console.log(err);
  }
};

const renderUser = (user) => {
  const markup = `
    <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
      <div class="card" data-id="${user._id}">
        <div class="infos">
          <div class="image"><img src="/images/user1.png" /></div>
          <div class="info">
            <div>
              <p class="name">
                ${user.name}
              </p>
              <p class="role">
                Role:
                ${user.role}
              </p>
              <p class="email">
                ${user.email}
              </p>
            </div>
            <div class="data">
              <p class="flex flex-col">Capacity
                <span class="state-value">${displaySize(user.maxSize)}MB</span>
              </p>
              <p class="flex">Used
                <span class="state-value">${displaySize(
                  user.usingSize
                )}MB</span>
              </p>
            </div>
          </div>
        </div>
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="dropdownMenuButton2"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Action
          </button>
          <ul
            class="dropdown-menu dropdown-menu-dark"
            aria-labelledby="dropdownMenuButton2"
          >
            <li><a class="dropdown-item" href="#">Edit</a></li>
            <li><hr class="dropdown-divider" /></li>
            <li class="delete"><a
                class="dropdown-item"
                href="#"
              >Delete</a></li>
          </ul>
        </div>
      </div>
    </div>
  `;
  const parent = document.querySelector(".row");
  parent.insertAdjacentHTML("beforeend", markup);
};

export const renderUsers = async (currPage) => {
  const query = document.querySelector(".input-navbar").value;
  const page = currPage || 1;
  const limit = 4;
  const parent = document.querySelector(".row");
  parent.innerHTML = "";
  try {
    const res = await axios({
      method: "GET",
      url: `api/users/?name=${query}&page=${page}&limit=${limit}`,
      data: {
        users,
      },
    });
    console.log(res.data);
    const users = res.data.data.users;
    // console.log(users);
    users.forEach((curr) => renderUser(curr));
    renderPagination(res.data.totalPages, page);
    highlightSelected(page);
  } catch (err) {
    console.log(err);
  }
};

export const sendWarningMail = async (fileId) => {
  try {
    const res = await axios({
      method: "POST",
      url: `api/reports/sendWarning/${fileId}`,
    });
    console.log("Mail sent successully!");
  } catch (err) {
    console.log(err);
  }
};
