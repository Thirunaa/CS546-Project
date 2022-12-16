//require express and express router
const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const postData = data.posts;
const employerData = data.employers;
const employeeData = data.employees;
const applicationData = data.applications;
const validations = require("../validations/dataValidations");
const path = require("path");
const multer = require("multer");
const xss = require("xss");

//Using multer to upload and store resume
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/resumes"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

let upload = multer({
  storage: storage,
}).single("resumeInput");

router.route("/:postId/apply").get(async (req, res) => {
  //checks if the session is active
  if (req.session.user) {
    const postID = req.params.postId;
    res.status(200).render("../views/pages/application", { postID: postID });
    return;
  } else {
    //renders signup page if not active
    res.redirect("/logout");
    return;
  }
});

router.route("/:postId/applied").post(async (req, res) => {
  const applicationInfo = req.body;
  const userName = req.session.user.userName;

  const postID = req.params.postId;

  try {
    const { education, workExpYrs, address, ex_salary } = applicationInfo;

    validations.validateID(postID);
    validations.validateUsername(userName);
    validations.validateSalary(ex_salary);


    //calling the createUser function with post body contents as it's arguments
    const newApplication = await applicationData.createApplication(
      userName,
      postID,
      education,
      workExpYrs,
      address,
      ex_salary
    );

    const updatedPost = await postData.addApplicants(userName, postID);
    console.log(updatedPost);
    //Displaying the success message
    //res.status(200).json("Job post successful");
    //res.redirect("/profile/" + userName);
    res.status(200).json({ message: "Succefully Applied", success: true });
    return;
  } catch (e) {
    res.status(400).json({ error: e, success: false });
  }
});

module.exports = router;