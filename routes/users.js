var express = require("express");
const path = require("path");
const Folder = require("./../models/folder");
var router = express.Router();
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const multiparty = require("multiparty");
const File = require("./../models/file");
const User = require("./../models/userModel");
const viewController = require("./../controllers/viewController");
const authController = require("./../controllers/authController");
const fsExtra = require("fs-extra");
const archiver = require("archiver");
const Share = require("../models/share");
const crypto = require("crypto");
const Report = require("../models/report");
const HistoryBuy = require("../models/historyBuy");
const timeZoneOffset = 7 * 60; // 7 hours ahead of UTC
const vietnamTime = new Date(Date.now() + timeZoneOffset * 60 * 1000);
router.get("/", authController.protect, viewController.getOverview);
router.get("/login", authController.checkLogin, viewController.getLoginForm);
router.get(
    "/forgotPassword",
    authController.checkLogin,
    viewController.getForgotPasswordForm
);
router.get(
    "/resetPassword",
    authController.checkLogin,
    viewController.getResetPasswordForm
);
router.get("/logout", authController.logout);

router.get(
    "/users",
    authController.protect,
    authController.restrict("admin"),
    viewController.getAllUsersView
);
router.get(
    "/reports",
    authController.protect,
    authController.restrict("admin"),
    viewController.getAllReportsView
);

// Refactored at userRoutes.js
// router.get("/logout", (req, res) => {
//     res.clearCookie("jwt")
//     res.clearCookie('user')
//     res.clearCookie('user_id')
//     res.redirect("/login")
// })
//

// *************************** //
// Run authController.protect middleware
// to redirects to /login (not logged in) or set current user to req.user (logged in)
// *************************** //
router.get("/data", async(req, res) => {
    const id = req.cookies.user_id;
    const files = await File.find({
        userId: id,
        isDele: false,
    });
    const filedata = [];
    filedata.push(files);
    const folders = await Folder.find({
        userId: id,
        isDele: false,
    });
    const folderdata = [];
    folderdata.push(folders);
    // add files and folders to filedata and folderdata as needed
    res.json({ filedata, folderdata });
});

router.get("/buyStorage", authController.protect, async(req, res) => {
    var us = await User.findOne({ _id: new ObjectId(req.cookies.user_id) });
    res.render("buyStorage", { us });
});

router.get("/upload", authController.protect, async(req, res) => {
    var us = await User.findOne({ _id: new ObjectId(req.cookies.user_id) });
    var folders = await Folder.find({
        userId: new ObjectId(req.cookies.user_id),
    });
    res.render("upload", { us, folders });
});

router.post("/upload", async(req, res, next) => {
    const form = new multiparty.Form();
    const emailUser = req.cookies.user;
    var folders1 = await Folder.find({
        userId: new ObjectId(req.cookies.user_id),
    });
    const allowExtension = [
        ".doc",
        ".docx",
        ".png",
        ".jpeg",
        ".jpg",
        ".txt",
        ".ppt",
        ".pdf",
        ".pptx",
        ".xls",
        ".xlsx",
    ];
    const maxSize = 5242880;
    var dir = ".\\public\\uploads\\" + emailUser;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let useSize = 0;
    const userCurr = await User.findOne({
        _id: req.cookies.user_id,
    });
    if (userCurr) {
        useSize = userCurr.usingSize;
    }
    if (useSize < userCurr.maxSize) {
        form.parse(req, async(err, fields, files) => {
            if (err) return res.send(500, "Internal Server Error");
            var folder = fields.folder[0];
            console.log(folder);
            var folderId = null;
            var pathToParent = "";
            if (folder !== "None") {
                var folder_choose = await Folder.findOne({
                    userId: new ObjectId(req.cookies.user_id),
                    name: folder,
                });
                folderId = folder_choose._id;
                dir = dir + "\\" + folder_choose.path.replace(/\//g, "\\");
            }
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            for (var i = 0; i < files.upload.length; i++) {
                var file = files.upload[i];
                var newPath = dir + "\\" + file.originalFilename;
                let isImage = 0;
                console.log(newPath);
                if (!fs.existsSync(newPath)) {
                    var oldPath = file.path;
                    const ext = path.extname(file.originalFilename).toLowerCase();
                    if (allowExtension.includes(ext) && file.size <= maxSize) {
                        const writeStream = fs.createWriteStream(newPath);
                        fs.createReadStream(oldPath).pipe(writeStream);
                        writeStream.on("finish", () => {
                            if (fs.existsSync(oldPath)) {
                                fs.unlinkSync(oldPath);
                            }
                        });
                        var image = "/images/";
                        if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
                            isImage = 1;
                            image = ".\\" + newPath.substring(9);
                        } else if (ext === ".txt") {
                            image = image + "txt.png";
                        } else if (ext === ".ppt" || ext === ".pptx") {
                            image = image + "ppt.png";
                        } else if (ext === ".pdf") {
                            image = image + "pdf.png";
                        } else if (ext === ".doc" || ext === ".docx") {
                            image = image + "doc.png"
                        } else if (ext === ".xls" || ext === ".xlsx") {
                            image = image + "xls.png"
                        }
                        const f = await File.create({
                            userId: req.cookies.user_id,
                            name: file.originalFilename,
                            folderId: folderId,
                            size: file.size,
                            isImage: isImage,
                            isDele: 0,
                            isShare: 0,
                            isImportant: 0,
                            image: image,
                            modify: vietnamTime,
                        });
                        const upd = await User.updateOne({
                            _id: req.cookies.user_id,
                        }, {
                            $set: {
                                usingSize: useSize + file.size,
                            },
                        });
                        if (userCurr.role === "admin") {
                            res.redirect("/admin/userPermission");
                        } else {
                            res.redirect("/");
                        }
                    } else {
                        res.render("upload", {
                            msg: `File ` +
                                file.originalFilename +
                                " extension is not allow to update or file too big",
                            us: userCurr,
                            folders: folders1
                        });
                        return;
                    }
                } else {
                    res.render("upload", {
                        msg: "File is exist",
                        us: userCurr,
                        folders: folders1
                    });
                    return;
                }
            }
        });
    } else {
        res.render("upload", {
            msg: "You have used up 1GB of free space. Please buy more storage",
            us: userCurr,
            folders: folders1
        });
    }
});

router.post("/folder", async(req, res, next) => {
    const id = req.cookies.user_id;
    const name = req.body.folder_name;
    const emailUser = req.cookies.user;
    const folder_current = req.body.currentFolder;
    let msg;
    let current = null;
    if (folder_current != "0") {
        current = await Folder.findOne({
            userId: new ObjectId(id),
            _id: folder_current,
        });
        console.log(current);
    }
    const currentDir = path.dirname(__filename);
    const targetDir = path.join(currentDir, "..", "public", "uploads");
    let folderPath = "/" + name + "/";
    var dir = targetDir + "\\" + emailUser;
    let parent = null;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (current != null) {
        parent = current._id;
        folderPath = current.path + name + "/";
        console.log(path);
        dir = dir + folderPath.replace(/\//g, "\\");
    } else {
        dir = dir + "\\" + name;
    }
    console.log(dir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        const fol = await Folder.create({
            userId: req.cookies.user_id,
            name: name,
            parent: parent,
            path: folderPath,
            isDele: 0,
            isImportant: 0,
            modify: vietnamTime,
        });
        console.log(vietnamTime);

        msg = {
            code: 1,
            msg: "Create Success",
        };
        res.send(msg);
    } else {
        msg = {
            code: 0,
            msg: "Folder name is exist",
        };
        res.send(msg);
    }
});
router.get("/folder/:id", async(req, res) => {
    const folder_id = req.params.id;
    const id = req.cookies.user_id;
    var current_folder = await Folder.findOne({
        userId: new ObjectId(id),
        _id: folder_id,
        isDele: false
    });
    var nameCurr = current_folder._id;
    var us = await User.findOne({ _id: new ObjectId(id) });
    var files = await File.find({
        userId: new ObjectId(id),
        folderId: new ObjectId(folder_id),
        isDele: false
    });
    console.log(files);
    var folders = await Folder.find({
        userId: new ObjectId(id),
        parent: new ObjectId(folder_id),
        isDele: false
    });
    var update = await Folder.updateOne({
        _id: folder_id,
    }, {
        $set: {
            modify: vietnamTime,
        },
    });
    console.log(nameCurr);
    res.render("index", { us, files, folders, nameCurr });
});
router.post("/rename", async(req, res) => {
    let current = req.body.currentId;
    let newname = req.body.new_name;
    let type = req.body.type;
    const id = req.cookies.user_id;
    const user = await User.findOne({ _id: id });
    const emailUser = user.email;
    let msg;
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);
    const currentDir = path.dirname(__filename);
    const targetDir = path.join(currentDir, "..", "public", "uploads", emailUser);
    if (type === "file") {
        let currentFile = await File.findOne({
            _id: current,
        });
        if (currentFile) {
            const ext = path.extname(currentFile.name).toLowerCase();
            let currentPath = targetDir + "\\" + currentFile.name;
            let imageSrc = currentFile.image.replace(currentFile.name, newname + ext);
            let newPath = targetDir + "\\" + newname + ext;
            if (currentFile.folderId != null) {
                let folderParent = await Folder.findOne({
                    _id: currentFile.folderId,
                });
                if (folderParent) {
                    currentPath =
                        targetDir +
                        folderParent.path.replace(/\//g, "\\") +
                        "\\" +
                        currentFile.name;
                    newPath =
                        targetDir +
                        folderParent.path.replace(/\//g, "\\") +
                        "\\" +
                        newname +
                        ext;
                }
            }
            if (fs.existsSync(newPath)) {
                msg = {
                    code: 0,
                    msg: "File name is exist",
                };
                res.send(msg);
                return;
            }
            try {
                await fs.promises.rename(currentPath, newPath);
                const files = await File.updateOne({
                    _id: current,
                }, {
                    $set: {
                        name: newname + ext,
                        image: imageSrc,
                        modify: vietnamTime,
                    },
                });
                const filesUpdate = await File.find({
                    userId: id,
                });
                if (files) {
                    msg = {
                        code: 1,
                        msg: "Success",
                    };
                    res.send(msg);
                }
            } catch (err) {
                msg = {
                    code: 0,
                    msg: err,
                };
            }
        } else {
            msg = {
                code: 0,
                msg: "File not found",
            };
            res.send(msg);
        }
    } else if (type === "folder") {
        let currentFolder = await Folder.findOne({
            _id: current,
        });
        if (currentFolder) {
            let currentName = currentFolder.name;
            let folderPath = targetDir + "\\" + currentFolder.path;
            let temp = currentFolder.path.split("/");
            for (let i = 0; i < temp.length; i++) {
                if (temp[i] === currentName) {
                    temp[i] = newname;
                }
            }
            let newFolderPath = targetDir + "\\" + temp.join("/");
            pathUpdate = temp.join("/");
            const pathRegex = new RegExp(`/${currentFolder.name}/`, "g");

            if (fs.existsSync(newFolderPath)) {
                msg = {
                    code: 0,
                    msg: "Folder name is exist",
                };
                res.send(msg);
                return;
            }
            try {
                await fsExtra.copy(folderPath, newFolderPath);
                const folder = await Folder.updateOne({
                    _id: current,
                }, {
                    $set: {
                        name: newname,
                        path: pathUpdate,
                        modify: vietnamTime,
                    },
                });
                const subFolder = await Folder.find({
                    path: pathRegex,
                });
                for (let i = 0; i < subFolder.length; i++) {
                    let inner = subFolder[i].path;
                    let new_inner = inner.split("/");

                    for (let i = 0; i < new_inner.length; i++) {
                        if (new_inner[i] === currentName) {
                            new_inner[i] = newname;
                        }
                    }
                    const inner_path = new_inner.join("/");
                    // let inner_path = inner.replace(inner, pathUpdate + subFolder[i].name)
                    const subUpdate = await Folder.updateMany({
                        _id: subFolder[i]._id,
                    }, {
                        $set: {
                            path: inner_path,
                            modify: vietnamTime,
                        },
                    });
                }
                const filesSrc = await File.find({});
                for (let i = 0; i < filesSrc.length; i++) {
                    let file = filesSrc[i].image;
                    let newImgeSrc = file.split("\\");
                    console.log(newImgeSrc);

                    for (let i = 0; i < newImgeSrc.length; i++) {
                        if (newImgeSrc[i] === currentName) {
                            newImgeSrc[i] = newname;
                        }
                    }

                    let newSrc = newImgeSrc.join("\\");
                    // let inner_path = inner.replace(inner, pathUpdate + subFolder[i].name)
                    const fileUpdate = await File.updateMany({
                        _id: filesSrc[i]._id,
                    }, {
                        $set: {
                            image: newSrc,
                            modify: vietnamTime,
                        },
                    });
                }
                await fsExtra.remove(folderPath);
                msg = {
                    code: 1,
                    msg: "Rename Folder Success",
                };
                res.send(msg);
                return;
            } catch (err) {
                console.log(err);
                msg = {
                    code: 0,
                    msg: err.message,
                };
                res.send(msg);
            }
        } else {
            msg = {
                code: 0,
                msg: "Not found the folder",
            };
            res.send(msg);
        }
    }
});

router.get("/downloadFile/:id", async(req, res) => {
    var idItem = req.params.id;
    console.log(idItem);
    // var emailUser = req.cookies.user;
    const currentDir = path.dirname(__filename);
    var file = await File.findOne({ _id: idItem });
    if (file) {
        const us = await User.findOne({
            _id: file.userId,
        });
        const emailUser = us.email;
        const targetDir = path.join(
            currentDir,
            "..",
            "public",
            "uploads",
            emailUser
        );

        let filePath = targetDir + "\\" + file.name;
        if (file.folderId != null) {
            let parent = await Folder.findOne({ _id: file.folderId });
            if (parent) {
                filePath =
                    targetDir + parent.path.replace(/\//g, "\\") + "\\" + file.name;
            }
        }
        console.log(filePath);

        if (fs.existsSync(filePath)) {
            res.setHeader("Content-Type", "application / octet-stream");
            res.setHeader("Content-Disposition", "attachment; filename=" + file.name);
            const readStream = fs.createReadStream(filePath);
            readStream.on("error", (err) => {
                console.error(err);
                res.status(500).end();
            });

            readStream.on("close", () => {
                res.end();
            });

            readStream.pipe(res);
        } else {
            res.status(400).send("File not found");
        }
    }
});
router.get("/downloadFolder/:id", async(req, res) => {
    var idItem = req.params.id;
    console.log(idItem);
    var emailUser = req.cookies.user;
    const currentDir = path.dirname(__filename);
    const targetDir = path.join(currentDir, "..", "public", "uploads", emailUser);
    var folder = await Folder.findOne({ _id: idItem });
    if (folder) {
        let folderPath = targetDir + "\\" + folder.name;
        if (folder.parent != null) {
            folderPath = targetDir + folder.path.replace(/\//g, "\\");
        }
        console.log(folderPath);
        if (fs.existsSync(folderPath)) {
            const ac = archiver("zip", { zlib: { level: 9 } });
            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${folder.name}.zip`
            );
            ac.pipe(res);
            ac.directory(folderPath, folder.name);
            ac.finalize();
        } else {
            res.status(400).send("Folder not found");
        }
    }
});
router.post("/delete", async(req, res) => {
    const id = req.body.currentId;
    const type = req.body.type;
    var msg;
    if (type === "file") {
        var file = await File.findOne({
            _id: id,
        });
        if (file) {
            var updateDele = await File.updateOne({
                _id: id,
            }, {
                $set: {
                    isDele: true,
                },
            });
            msg = {
                code: 1,
                msg: "Delete Success",
            };
            res.send(msg);
        } else {
            msg = {
                code: 0,
                msg: "Not found file to delete",
            };
            res.send(msg);
        }
    } else {
        var folder = await Folder.findOne({
            _id: id,
        });
        if (folder) {
            const pathRegex = new RegExp(`/${folder.name}/`, "g");
            var updateDeleFo = await Folder.updateOne({
                _id: id,
            }, {
                $set: {
                    isDele: true,
                },
            });
            var subFolder = await Folder.find({
                path: pathRegex,
            });
            var updateDeleSubFol = await Folder.updateMany({
                path: pathRegex,
            }, {
                $set: {
                    isDele: true,
                },
            });
            for (let i = 0; i < subFolder.length; i++) {
                var updateDeleFile = await File.updateOne({
                    folderId: subFolder[i]._id,
                }, {
                    $set: {
                        isDele: true,
                    },
                });
            }
            msg = {
                code: 1,
                msg: "Delete Success",
            };
            res.send(msg);
        } else {
            msg = {
                code: 0,
                msg: "Not found folder to delete",
            };
            res.send(msg);
        }
    }
});
router.get("/trash", async(req, res) => {
    const idU = req.cookies.user_id;
    var us = await User.findOne({
        _id: idU,
    });
    var files = await File.find({
        userId: idU,
        isDele: true,
    });

    // console.log(files)
    var folders = await Folder.find({
        userId: idU,
        isDele: true,
    });

    res.render("index", { us, files, folders });
});
router.post("/permanenlyDelete", async(req, res) => {
    var emailUser = req.cookies.user;
    const currentDir = path.dirname(__filename);
    const targetDir = path.join(currentDir, "..", "public", "uploads", emailUser);
    const id = req.body.currentId;
    const us = await User.findOne({
        _id: req.cookies.user_id
    })
    let usingSize = us.usingSize;
    const type = req.body.type;
    let msg;
    if (type === "file") {
        var file = await File.findOne({
            _id: id,
        });
        if (file) {
            var size = file.size;
            usingSize = usingSize - size
            var filePath = targetDir + "\\" + file.name;
            if (file.folderId != null) {
                let folderParent = await Folder.findOne({
                    _id: file.folderId,
                });
                if (folderParent) {
                    filePath =
                        targetDir +
                        folderParent.path.replace(/\//g, "\\") +
                        "\\" +
                        file.name;
                }
            }
            if (fs.existsSync(filePath)) {
                try {
                    await fs.promises.unlink(filePath);
                    var deleFile = await File.deleteOne({
                        _id: id,
                    });
                    var upSize = await User.updateOne({
                        _id: req.cookies.user_id
                    }, {
                        $set: {
                            usingSize: usingSize
                        }
                    })
                    msg = {
                        code: 1,
                        msg: "Delete success",
                    };
                    res.send(msg);
                } catch (error) {
                    msg = {
                        code: 0,
                        msg: error.message,
                    };
                    res.send(msg);
                }
            } else {
                msg = {
                    code: 0,
                    msg: "File path is not exist",
                };
                res.send(msg);
            }
        } else {
            msg = {
                code: 0,
                msg: "File is not exist",
            };
            res.send(msg);
        }
    } else {
        let folder = await Folder.findOne({
            _id: id,
        });
        if (folder) {
            let folderPath = targetDir + folder.path.replace(/\//g, "\\");
            const pathRegex = new RegExp(`/${folder.name}/`, "g");
            if (fs.existsSync(folderPath)) {
                try {
                    await fsExtra.remove(folderPath);
                    var subFolder = await Folder.find({
                        path: pathRegex,
                    });
                    for (let i = 0; i < subFolder.length; i++) {
                        var deleFile = await File.deleteOne({
                            folderId: subFolder[i]._id,
                        });
                    }
                    const deleSub = await Folder.deleteMany({
                        path: pathRegex,
                    });
                    const delteCurr = await Folder.deleteOne({
                        _id: id,
                    });

                    msg = {
                        code: 1,
                        msg: "Delete Success",
                    };
                    res.send(msg);
                } catch (error) {
                    msg = {
                        code: 0,
                        msg: error.message,
                    };
                    res.send(msg);
                }
            } else {
                msg = {
                    code: 0,
                    msg: "Folder path is not exist",
                };
                res.send(msg);
            }
        } else {
            msg = {
                code: 0,
                msg: "Folder is not exist",
            };
            res.send(msg);
        }
    }
});
router.post("/restore", async(req, res) => {
    const id = req.body.currentId;
    const type = req.body.type;
    var msg;
    if (type === "file") {
        var file = await File.findOne({
            _id: id,
        });
        if (file) {
            var updateDele = await File.updateOne({
                _id: id,
            }, {
                $set: {
                    isDele: false,
                },
            });
            msg = {
                code: 1,
                msg: "Restore Success",
            };
            res.send(msg);
        } else {
            msg = {
                code: 0,
                msg: "Not found file to restore",
            };
            res.send(msg);
        }
    } else {
        var folder = await Folder.findOne({
            _id: id,
        });
        if (folder) {
            const pathRegex = new RegExp(`/${folder.name}/`, "g");
            var updateDeleFo = await Folder.updateOne({
                _id: id,
            }, {
                $set: {
                    isDele: false,
                },
            });
            var subFolder = await Folder.find({
                path: pathRegex,
            });
            var updateDeleSubFol = await Folder.updateMany({
                path: pathRegex,
            }, {
                $set: {
                    isDele: false,
                },
            });
            for (let i = 0; i < subFolder.length; i++) {
                var updateDeleFile = await File.updateOne({
                    folderId: subFolder[i]._id,
                }, {
                    $set: {
                        isDele: false,
                    },
                });
            }
            msg = {
                code: 1,
                msg: "Restore Success",
            };
            res.send(msg);
        } else {
            msg = {
                code: 0,
                msg: "Not found folder to restore",
            };
            res.send(msg);
        }
    }
});
router.post("/share/:id", async(req, res) => {
    const idFile = req.params.id;
    const userShare = req.body.userShare;
    const access = req.body.access;
    const users = userShare.slice(1, -1);
    let type = 0;
    if (access === "have-link") {
        type = 1;
    }
    const list = users.split(",");

    const idShare = req.cookies.user_id;

    const randomBytes = crypto.randomBytes(32);
    const keyShare = randomBytes.toString("hex");
    for (let i = 0; i < list.length; i++) {
        var shared = await Share.create({
            userShare: idShare,
            userReceive: list[i].replace(/^"(.*)"$/, "$1"),
            fileId: idFile,
            type: type,
            keyShare: keyShare,
            modify: vietnamTime,
        });
    }
    const update = await File.updateOne({
        _id: idFile,
    }, {
        $set: {
            isShare: true,
        },
    });
    const link = `http://localhost:3000/shared/${keyShare}`;
    res.send(link);
});
router.get("/shared/:keyShare", async(req, res) => {
    const idU = req.cookies.user_id;
    var us = await User.findOne({
        _id: idU,
    });
    const key = req.params.keyShare;
    const currentUs = req.cookies.user;
    const filesReceive = [];
    var fileShare = await Share.findOne({
        keyShare: key,
    });
    if (fileShare) {
        console.log(fileShare.type);
        if (fileShare.type === 1) {
            var f = await File.findOne({
                _id: fileShare.fileId,
            });
            filesReceive.push(f);
        } else if (fileShare.type === 0) {
            if (
                fileShare.userReceive === currentUs ||
                fileShare.userShare.toString() === req.cookies.user_id
            ) {
                var file = await File.findOne({
                    _id: fileShare.fileId,
                });
                filesReceive.push(file);
            } else {
                res.render("404", {
                    layout: false,
                    err: "You not allow to access this file",
                });
                return;
            }
        }
        const idFile = await Share.find({
            userReceive: currentUs,
        });
        console.log(idFile);

        for (let i = 0; i < idFile.length; i++) {
            if (idFile[i].keyShare !== key) {
                var recei = await File.findOne({
                    _id: idFile[i].fileId,
                    isDele: false,
                });
                filesReceive.push(recei);
            }
        }
        res.render("shareFile", { us, filesReceive });
    } else {
        res.render("404", { layout: false, err: "File is not exist" });
    }
});
router.get("/shared", async(req, res) => {
    const idU = req.cookies.user_id;
    var us = await User.findOne({
        _id: idU,
    });
    const currentUs = req.cookies.user;
    const filesReceive = [];
    const idFile = await Share.find({
        userReceive: currentUs,
    });
    console.log(idFile);
    for (let i = 0; i < idFile.length; i++) {
        var recei = await File.findOne({
            _id: idFile[i].fileId,
        });
        filesReceive.push(recei);
    }
    const filesShare = await File.find({
        userId: idU,
        isShare: true,
        isDele: false,
    });
    res.render("shareFile", { us, filesReceive, filesShare });
});
router.get("/preview/:id", async(req, res) => {
    var idItem = req.params.id;
    console.log(idItem);
    // var emailUser = req.cookies.user;
    const currentDir = path.dirname(__filename);
    var file = await File.findOne({ _id: idItem });
    if (file) {
        const us = await User.findOne({
            _id: file.userId,
        });
        const emailUser = us.email;
        const targetDir = path.join(
            currentDir,
            "..",
            "public",
            "uploads",
            emailUser
        );
        let filePath = targetDir + "\\" + file.name;
        const fileExt = file.name.split(".").pop().toLowerCase();
        if (file.folderId != null) {
            let parent = await Folder.findOne({ _id: file.folderId });
            if (parent) {
                filePath =
                    targetDir + parent.path.replace(/\//g, "\\") + "\\" + file.name;
            }
        }
        console.log(fileExt, filePath);
        let mimeType;
        if (fileExt === "jpg" || fileExt === "jpeg") {
            mimeType = "image/jpeg";
        } else if (fileExt === "png") {
            mimeType = "image/png";
        } else if (fileExt === "gif") {
            mimeType = "image/gif";
        } else if (fileExt === "pdf") {
            mimeType = "application/pdf";
        } else if (fileExt === "ppt" || fileExt === "pptx") {
            mimeType = "application/vnd.ms-powerpoint";
        } else {
            res.render("404", { layout: false, err: "File type is not support" });
            return;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.render("404", { layout: false, err: "File path is not exist" });
                return;
            }

            const base64Data = Buffer.from(data).toString("base64");
            const fileSrc = `data:${mimeType};base64,${base64Data}`;
            res.send(`<iframe src="${fileSrc}" width="100%" height="100%"></iframe>`);
        });
    } else {
        res.render("404", { layout: false, err: "File is not exist" });
    }
});
router.get("/report/:id", async(req, res) => {
    const fileId = req.params.id;
    const file = await File.findOne({
        _id: fileId,
    });
    if (file) {
        res.render("userReport", { file });
    } else {
        res.send("Not found");
    }
});
router.post("/report/:id", async(req, res) => {
    const userReport = req.cookies.user_id;
    const fileId = req.params.id;
    const type = req.body.type;
    let msg;
    const report = Report.create({
        userReport: userReport,
        fileId: fileId,
        type: type,
        modify: vietnamTime,
    });
    if (report) {
        msg = {
            code: 0,
            msg: "Your report has been sent successfully",
        };
        res.send(msg);
    } else {
        msg = {
            code: 0,
            msg: "An error occurred while submitting your report",
        };
        res.send(msg);
    }
});

router.get("/admin", async(req, res) => {
    const users = await User.find();
    let countUser = 0,
        countAdmin = 0;
    users.forEach((curr) => {
        curr.role === "user" ? countUser++ : countAdmin++;
    });
    const countReport = await Report.estimatedDocumentCount();
    res.status(200).render("indexAdmin", {
        title: "Management",
        countUser,
        countAdmin,
        countReport,
    });
})

router.post("/upgrade", async(req, res) => {
    const package = req.body.package;
    const price = req.body.priceData;
    const nameCard = req.body.name_card;
    const numberCard = req.body.number_card;
    const cvv = req.body.cvv;
    const endDate = req.body.endDate;
    const userId = req.cookies.user_id;
    var us = await User.findOne({ _id: new ObjectId(req.cookies.user_id) });
    var currentMaxSize = us.maxSize;
    let msg = "Buy more storage successfully.";
    let addStorage = 209715200;
    if (package == "1") {
        addStorage = 524288000;
    } else if (package == "2") {
        addStorage = 1073741824;
    }
    const inputDate = new Date(Date.parse(endDate));
    const today = new Date();

    if (inputDate.getTime() < today.getTime()) {
        msg = "Your card is past due";
        res.render("buyStorage", { us, msg });
    } else {
        if (numberCard === "111111" && cvv === "411") {
            if (price > 200000) {
                msg = "Insufficient payment limit";
            } else {
                var history = await HistoryBuy.create({
                    userId: userId,
                    package: package,
                    price: price,
                    modify: vietnamTime,
                });
                var upgrade = await User.updateOne({
                    _id: userId,
                }, {
                    $set: {
                        maxSize: currentMaxSize + addStorage,
                    },
                });
            }
        } else if (numberCard === "222222" && cvv === "443") {
            if (price > 500000) {
                msg = "Insufficient payment limit";
            } else {
                var history = await HistoryBuy.create({
                    userId: userId,
                    package: package,
                    price: price,
                    modify: vietnamTime,
                });
                var upgrade = await User.updateOne({
                    _id: userId,
                }, {
                    $set: {
                        maxSize: currentMaxSize + addStorage,
                    },
                });
            }
        } else if (numberCard === "333333" && cvv === "577") {
            if (price > 1000000) {
                msg = "Insufficient payment limit";
            } else {
                var history = await HistoryBuy.create({
                    userId: userId,
                    package: package,
                    price: price,
                    modify: vietnamTime,
                });
                var upgrade = await User.updateOne({
                    _id: userId,
                }, {
                    $set: {
                        maxSize: currentMaxSize + addStorage,
                    },
                });
            }
        } else {
            msg = "Incorrect account information";
        }
        res.render("buyStorage", { us, msg });
    }
});

router.get("/star", async(req, res) => {
    const idU = req.cookies.user_id;
    var us = await User.findOne({
        _id: idU,
    });
    var files = await File.find({
        userId: idU,
        isImportant: true,
        isDele: false,
    });
    // console.log(files)
    var folders = await Folder.find({
        userId: idU,
        isImportant: true,
        isDele: false,
    });
    // console.log(folders)

    res.render("index", { us, files, folders });
});

router.post("/star/:id", async(req, res) => {
    var msg;
    var id = req.params.id;
    var file = await File.findOne({
        _id: id,
    });
    if (file) {
        if (file.isImportant) {
            var update = await File.updateOne({
                _id: id,
            }, {
                $set: {
                    isImportant: false,
                },
            });
            msg = {
                code: 1,
                mess: "Remove file from important success",
            };
            res.send(msg);
        } else {
            var update = await File.updateOne({
                _id: id,
            }, {
                $set: {
                    isImportant: true,
                },
            });
            msg = {
                code: 1,
                mess: "Add file to important success",
            };
            res.send(msg);
        }
    } else {
        var folder = await Folder.findOne({
            _id: id,
        });
        if (folder) {
            if (folder.isImportant) {
                var updateFolder = await Folder.updateOne({
                    _id: id,
                }, {
                    $set: {
                        isImportant: false,
                    },
                });
                msg = {
                    code: 1,
                    mess: "Remove folder from important success",
                };
                res.send(msg);
            } else {
                var updateFolder = await Folder.updateOne({
                    _id: id,
                }, {
                    $set: {
                        isImportant: true,
                    },
                });
                msg = {
                    code: 1,
                    mess: "Add folder to important success",
                };
                res.send(msg);
            }
        } else {
            msg = {
                code: 0,
                mess: "Not find item",
            };
            res.send(msg);
        }
    }
});

router.get("/recent", async(req, res) => {
    const idU = req.cookies.user_id;
    var us = await User.findOne({
        _id: idU,
    });
    var files = await File.find({
            userId: idU,
            isDele: false,
        })
        .sort({ modify: -1 })
        .limit(5);
    // console.log(files)
    var folders = await Folder.find({
            userId: idU,
            isDele: false,
        })
        .sort({ modify: -1 })
        .limit(5);
    res.render("index", { us, files, folders });
});

module.exports = router;