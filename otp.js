document.addEventListener("DOMContentLoaded", function () {

  const contin = document.querySelector(".continue");
  const verify = document.querySelector(".verify");
  const email = document.getElementById("email");//one input field
  const inputs = document.querySelectorAll("#allfour input");
  const userid = document.querySelector(".pop"); // user email id display here
  const one = document.querySelector(".one");
  const two = document.querySelector(".two");
  const three = document.querySelector(".three");
  const errorso = document.querySelector(".errors")
  const error = document.querySelector(".err")
  let otpRegenerationInterval;

  let currentotp;
  const start = 2;
  let time = start * 60;
  const countert = document.querySelector(".counters");
  let interval = setInterval(update, 1000);
  let flickerInterval;

  if (one && two && three) {   // hame one bhi likhna hoga if we even know that first box appears
    one.style.display = "flex";
    two.style.display = "none";
    three.style.display = "none";               // initially we have to put flex for one ...
  }
  else {
    console.error("Elements not found: .two or .three");
  }

  if (contin) {
    contin.classList.add("disable");
    contin.disabled = true;
  } else {
    console.error("continue button not work due to some error")
  }

  if (verify) {
    verify.classList.add("disable");
    verify.disabled = true;
  } else {
    console.error("verify button not work due to some error");
  }

  if (email) {
    email.addEventListener("input", validate);
  }
  else {
    console.error("no email  found")
  }

  if (inputs && inputs.length > 0) {
    inputs.forEach((input, index) => {

      input.addEventListener("input", (e) => {
        const value = e.target.value;

        if (value.length > 1) {
          e.target.value = value.slice(0, 1);
        }
        if (value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }

        checkotps();
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });
  }
  else {
    console.log("field of otp is not empty")
  }

  if (one) {
    one.addEventListener("submit", (e) => {
      e.preventDefault();      // submit only works for form in html use onclick for div
      validate(e);
    });
  }

  if (contin) {
    contin.addEventListener("click", () => {
      if (one && two) {
        one.style.display = "none"
        two.style.display = "flex"

        if (userid) {
          userid.innerHTML = email.value;
        }

        currentotp = congenotp();
        console.log(`Generated OTP: ${currentotp}`);


        fetch("http://localhost:3030/sendotp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.value,
            otp: currentotp,
          })
        })
          .then(res => res.text())
          .then(data => {
            console.log("server response", data);
          })
          .catch(err => {
            console.error("Failed to send OTP email:", err);
          });

        startTimer();
        startOtpRegeneration();
      }
    });
  }

  if (verify) {
    verify.addEventListener("click", () => {
      let nowotp = "";
      inputs.forEach(input => {
        nowotp += input.value;
      }
      )

      if (nowotp === currentotp.toString()) {
        if (two && three) {
          two.style.display = "none";
          three.style.display = "flex";

          if (flickerInterval) clearInterval(flickerInterval);
          if (interval) clearInterval(interval);
        }
      } else {
        verify.classList.add("shake")   //this is an global scope element we can not use here
        if (errorso) {
          console.error("Invalid OTP try again")
          errorso.innerHTML = "Invalid OTP try again";
        }
        setTimeout(() => {
          verify.classList.remove("shake");
        }, 1000);
      }
    });
  }

  function startOtpRegeneration() {

    if (otpRegenerationInterval) {
      clearInterval(otpRegenerationInterval);
    }
    otpRegenerationInterval = setInterval(() => {
      if (two && two.style.display === "flex") {
        currentotp = congenotp();
        console.log(`New OTP after 2 minutes: ${currentotp}`)
        if (inputs) {
          inputs.forEach(input => {
            input.value = "";
          });
        }

        if (verify) {
          verify.classList.add("disable");
          verify.disabled = true;
        }

        startTimer();
      }
    }, 120000);
  }

  function startTimer() {
    if (interval) clearInterval(interval);
    if (flickerInterval) clearInterval(flickerInterval);
    time = start * 60;
    interval = setInterval(update, 1000);
    update();
  }

  function update() {
    if (!countert) return;

    const minutes = Math.floor(time / 60);
    let sec = time % 60;

    sec = sec < 10 ? "0" + sec : sec;
    countert.innerHTML = `${minutes}:${sec}`;

    if (time <= 0) {
      clearInterval(interval);
      if (flickerInterval) {
        clearInterval(flickerInterval);
      }
      countert.classList.remove("flicker");
      countert.innerHTML = "00:00";


      currentotp = congenotp();
      console.log(`New OTP after timeout: ${currentotp}`);


      if (inputs) {
        inputs.forEach(input => {
          input.value = "";
        });
      }


      if (verify) {
        verify.classList.add("disable");
        verify.disabled = true;    // for boolean value we have to used without "".
      }

      return;
    }

    if (time === 30 && !flickerInterval) {
      startfk();
    }

    time--;
  }

  function startfk() {    // for add flicker 
    flickerInterval = setInterval(() => {
      countert.classList.toggle("flicker");
    }, 500);

    setTimeout(() => {
      clearInterval(flickerInterval);
      countert.classList.remove("flicker");
    }, 30000);
  }


  function isemail(emailval) {
    let regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(emailval);
  }
  function validate() {
    const emailval = email.value.trim();
    const error = document.querySelector(".err")

    if (emailval === "") {
      setErrorMsg(error, "Email cannot be blank");  // we do here validation for sake so we remove email
    }

    else if (!isemail(emailval)) {
      setErrorMsg(error, "Invalid Email");
    }
    else {
      setSuccessMsg(error);
    }
  }

  function setErrorMsg(input, errormsg) {
    error.innerText = errormsg
    error.style.visibility = "visible";

    if (contin) {
      contin.classList.add("disable");
      contin.disabled = true;
    }
  }

  function setSuccessMsg(input) {
    error.style.visibility = "hidden";
    if (contin) {
      contin.classList.remove("disable");
      contin.disabled = false;
    }
  }

  function checkotps() {
    let allfill = true;
    inputs.forEach(input => {
      if (!input.value) {
        allfill = false;
      }
    });


    if (verify) {
      if (allfill) {
        verify.classList.remove("disable");
        verify.disabled = false;
      } else {
        verify.classList.add("disable");
        verify.disabled = true;
      }
    }
  }

  function congenotp() {
    let otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp)
    return otp;
  }

});