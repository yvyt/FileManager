function goToSubfolder(id) {
    window.location.href = "/folder/" + id
}

function showCreate() {
    const modal = document.getElementById('create-dialog');
    modal.style.display = "block"
}

function showDelete(id, name, type) {
    const modal = document.getElementById('delete-dialog');
    modal.style.display = "block"
    document.getElementById("type-dele").value = type
    document.getElementById("currentId-dele").value = id
    document.getElementById("dele").innerText = `Are you sure that you want to delete ${type} ${name}!!!`
}

function showDeleteDialog(id, name, type) {
    const modal = document.getElementById('delete-perman-dialog');
    modal.style.display = "block"
    document.getElementById("type-perman").value = type
    document.getElementById("currentId-perman").value = id
    document.getElementById("permanenly").innerText = `Are you sure that you want to permanenly delete ${type} ${name}!!!`
}

function showRenameDialog(id, name, type) {
    const modal = document.getElementById("rename-dialog");
    modal.style.display = "block";
    document.getElementById("current-filename").innerText = name
    document.getElementById("type").value = type
    document.getElementById("currentId").value = id
}

function showShare(id) {
    const modal = document.getElementById('share-dialog');
    document.getElementById("idFile").value = id

    modal.style.display = "block"
}

function changeGeneralAccess() {
    const restricted = document.getElementById('restricted');
    const have_link = document.getElementById('have-link');

    restricted.style.display = "block";
    have_link.style.display = "none";

    const selectElements = document.querySelectorAll('select');
    selectElements.forEach((selectElement) => {
        selectElement.addEventListener('change', (event) => {
            const selectedOption = event.target.value;
            if (selectedOption === "restricted") {
                restricted.style.display = "block";
                have_link.style.display = "none";
            } else {
                restricted.style.display = "none";
                have_link.style.display = "block";
            }
        })
    })
}

function closeRenameDialog() {
    const modal = document.getElementById("rename-dialog");
    modal.style.display = "none";
}

function closeCreateDialog() {
    const modal = document.getElementById("create-dialog");
    modal.style.display = "none";
}

function closeDeleteDialog() {
    const modal = document.getElementById("delete-dialog");
    modal.style.display = "none";
}

function closeDeletePermanDialog() {
    const modal = document.getElementById("delete-perman-dialog");
    modal.style.display = "none";
}

function closeShareDialog() {
    const modal = document.getElementById("share-dialog");
    document.getElementById("hidden").innerHTML = ""
    document.getElementById("display_user").innerHTML = ""
    modal.style.display = "none";
}

function rename() {
    const curentId = document.getElementById("currentId").value
    const type = document.getElementById("type").value
    const newname = document.getElementById("new_name").value
    console.log(curentId + "/" + type + "/" + newname)
    $.ajax({
        url: '/rename',
        type: 'POST',
        data: {
            currentId: curentId,
            type: type,
            new_name: newname
        },
        success: function(response) {
            console.log(response)
            if (response.code == 1) {
                location.reload()
            } else if (response.code == 0) {
                document.getElementById("renameDialog").innerHTML = `<div id="errorRename">${response.msg}</div>`
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });

}

function toDelete() {
    const curentId = document.getElementById("currentId-dele").value
    const type = document.getElementById("type-dele").value
    console.log(curentId + "/" + type)
    $.ajax({
        url: '/delete',
        type: 'POST',
        data: {
            currentId: curentId,
            type: type,
        },
        success: function(response) {
            console.log(response)
            if (response.code == 1) {
                location.reload()
            } else if (response.code == 0) {
                document.getElementById("deleteDialog").innerHTML = `<div id="errorRename">${response.msg}</div>`
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });
}

function toDeletePerman() {
    const curentId = document.getElementById("currentId-perman").value
    const type = document.getElementById("type-perman").value
    console.log(curentId + "/" + type)
    $.ajax({
        url: '/permanenlyDelete',
        type: 'POST',
        data: {
            currentId: curentId,
            type: type,
        },
        success: function(response) {
            console.log(response)
            if (response.code == 1) {
                location.reload()
            } else if (response.code == 0) {
                document.getElementById("permanDeleteDialog").innerHTML = `<div id="errorRename">${response.msg}</div>`
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });
}

function createFolder() {
    const nameCurrent = document.getElementById("nameCurrent").value
    const folder_name = document.getElementById("folder_name").value
    $.ajax({
        url: '/folder',
        type: 'POST',
        data: {
            currentFolder: nameCurrent,
            folder_name: folder_name
        },
        success: function(response) {
            console.log(response)
            if (response.code == 1) {
                location.reload()
            } else if (response.code == 0) {
                document.getElementById("createDialog").innerHTML = `<div id="errorRename">${response.msg}</div>`
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });
}

function toImportant(id) {
    $.ajax({
        url: `/star/${id}`,
        type: 'POST',

        success: function(response) {
            alert(response.mess)

        },
        error: function(error) {
            alert(error.message)
        }
    });
}
$(document).ready(function() {
    $("#charSearch").on('input', function() {
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                const { filedata, folderdata } = data;
                var char = $("#charSearch").val();

                var file_data = []
                var folder_data = []
                if (filedata) {
                    for (let i = 0; i < filedata[0].length; i++) {
                        file_data.push(filedata[0][i])
                    }

                }
                let resultFile = []
                let resultFolder = []
                if (char) {
                    resultFile = file_data.filter(element => element['name'].toLowerCase().includes(char));
                    console.log(resultFile)
                    if (folderdata) {
                        for (let i = 0; i < folderdata[0].length; i++) {
                            folder_data.push(folderdata[0][i])
                        }
                        resultFolder = folder_data.filter(element => element['name'].includes(char));
                        console.log(resultFolder)
                    }
                } else {
                    resultFile = file_data.filter(element => element['folderId'] == null);
                    console.log(resultFile)
                    if (folderdata) {
                        for (let i = 0; i < folderdata[0].length; i++) {
                            folder_data.push(folderdata[0][i])
                        }
                        resultFolder = folder_data.filter(element => element['parent'] == null);
                        console.log(resultFolder)
                    }
                }
                var html_result = "";
                if (resultFolder.length > 0) {
                    var ht1 = "";
                    for (i = 0; i < resultFolder.length; i++) {
                        ht1 += `<div class="col-lg-3 col-md-4 col-sm-6">`;
                        ht1 += `<div class="card">`;
                        ht1 += `<div class="card-body">`;
                        ht1 += `<div>`;
                        ht1 += `<img src="/images/folder.webp" alt="" style="width: 160px;height:160px" />`;
                        ht1 += `</div>`;
                        ht1 += `<span class="file-name" onclick="goToSubfolder('${resultFolder[i]['_id']}')">${resultFolder[i]['name']}</span>`;
                        ht1 += `<div class="btn-group mt-2" aria-disabled="true">`
                        ht1 += `<p>`
                        ht1 += `<ion-icon name="pencil-outline" onclick="showRenameDialog('${resultFolder[i]['_id']}','${resultFolder[i]['name']}','folder')"></ion-icon>`
                        if (resultFolder[i]['isImportant']) {
                            ht1 += `<ion-icon name="star" onclick="toImportant('${resultFolder[i]['_id']}')"></ion-icon>`;

                        } else {
                            ht1 += `<ion-icon name="star-outline" onclick="toImportant('${resultFolder[i]['_id']}')"></ion-icon>`;

                        }
                        ht1 += `<a href="/downloadFolder/${resultFolder[i]['_id']}"><ion-icon name="cloud-download-outline"></ion-icon></a>`;
                        ht1 += `<ion-icon name="trash-outline" onclick="showDelete('${resultFolder[i]['_id']}','${resultFolder[i]['name']}','folder')"></ion-icon>`;
                        ht1 += `</p>`;
                        ht1 += `</div>`;
                        ht1 += `</div>`;
                        ht1 += `</div>`;
                        ht1 += `</div>`;

                    }
                    html_result += ht1;
                }
                if (resultFile.length > 0) {
                    ht2 = "";
                    for (i = 0; i < resultFile.length; i++) {
                        ht2 += `<div class=" col-lg-3 col-md-4 col-sm-6">`;
                        ht2 += `<div class="card">`;
                        ht2 += `<div class="card-body">`;
                        ht2 += `<div style="width: 160px;height:160px">`;
                        if (resultFile[i]['isImage']) {
                            ht2 += `<img src='.\\.${resultFile[i]['image']}' alt="" style="width: 160px;height:160px" />`;
                        } else {
                            ht2 += `<img src="${resultFile[i]['image']}" alt="" style="width: 160px;height:160px" />`;

                        }

                        ht2 += `</div>`;
                        ht2 += `<span class="file-name">${resultFile[i]['name']}</span>`;
                        ht2 += `<div class="btn-group mt-2">`;
                        ht2 += `<p>`;
                        ht2 += `<ion-icon name="share-social-outline" onclick="showShare('${resultFile[i]['_id']}')"></ion-icon>`;
                        ht2 += `<ion-icon name="pencil-outline" onclick="showRenameDialog('${resultFile[i]['_id']}','${resultFile[i]['name']}','file')"></ion-icon>`
                        if (resultFile[i]['isImportant']) {
                            ht2 += `<ion-icon name="star" onclick="toImportant('${resultFile[i]['id']}')"></ion-icon>`;

                        } else {
                            ht2 += `<ion-icon name="star-outline" onclick="toImportant('${resultFile[i]['_id']}')"></ion-icon>`;

                        }
                        ht2 += `<ion-icon name="trash-outline" onclick="showDelete('${resultFile[i]['_id']}','${resultFile[i]['name']}','file')"></ion-icon>`;

                        ht2 += `<ion-icon name="eye-outline"></ion-icon>`;
                        ht2 += `<a href="/downloadFile/${resultFile[i]['_id']}"><ion-icon name="cloud-download-outline"></ion-icon></a>`;
                        ht2 += `</p>`
                        ht2 += "</div>";
                        ht2 += "</div>";
                        ht2 += "</div>";
                        ht2 += "</div>";
                    }
                    html_result += ht2;
                }
                document.getElementById("display").innerHTML = html_result;
                console.log(html_result)
            });

    })
});

function restore(id, type) {
    $.ajax({
        url: '/restore',
        type: 'POST',
        data: {
            currentId: id,
            type: type,
        },
        success: function(response) {
            console.log(response)
            if (response.code == 1) {
                alert(response.msg)
                window.location.href = "/";
            } else if (response.code == 0) {
                alert(response.msg)
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });

}


const inputUser = document.getElementById("addUser")
inputUser.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
        const text = inputUser.value
        const list = document.getElementById("hidden")
        list.insertAdjacentHTML('beforeend', `<input type="hidden" id="my-hidden-input" value=${text} name="user[]">`)
        document.getElementById("display_user").insertAdjacentHTML("beforeend", `<p class="access-title" style="margin-left: 30px; margin-top:10px" name="userShare"> ${text}</p> `)
        inputUser.value = ""
    }
})

function shareFile() {
    const idFile = document.getElementById("idFile").value
    const userShare = document.getElementsByName("user[]")
    var listUser = []
    const access = document.getElementById("access").value

    for (let i = 0; i < userShare.length; i++) {
        listUser.push(userShare[i].value)
    }
    // console.log(idFile, JSON.stringify(listUser), access)
    $.ajax({
        url: '/share/' + idFile,
        type: 'POST',
        data: {
            userShare: JSON.stringify(listUser),
            access: access,
        },
        success: function(response) {
            document.getElementById("linkShare").value = response

        },
        error: function(error) {
            alert(error.message)
        }
    });
}


function copyLink() {
    const input = document.getElementById('linkShare');
    input.select();
    document.execCommand('copy');
    closeShareDialog();
    alert('Copied to clipboard: ' + input.value);
}

function sendReport() {
    var idFile = document.getElementById("fileId").value
    var list = document.getElementsByName("rad")
    let type = 0
    for (let i = 0; i < list.length; i++) {
        if (list[i].checked) {
            type = list[i].value
        }
    }
    $.ajax({
        url: '/report/' + idFile,
        type: 'POST',
        data: {
            type: type,
        },
        success: function(response) {

            if (response.code == 1) {
                alert(response.msg)
                window.location.href = "/";
            } else if (response.code == 0) {
                alert(response.msg)
            }
        },
        error: function(error) {
            alert(error.message)
        }
    });
}