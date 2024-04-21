(async () => {
    if (localStorage["DEBLOKAUTH"] != undefined) {
      let tkncheck = await fetch("/api/auth/tokenvalidate", {
        verbose:true,
        method: "POST",
        body: localStorage["DEBLOKAUTH"],
      });
      if (tkncheck.ok) {
      } else {
        document.location = "login.html";
      }
    } else {
      document.location = "login.html";
    }
  })();
  (() => {
    if (document.location.hash == "#" || document.location.hash == "") {
      document.location = "/";
    }
    console.log(document.location.hash);
    let params = document.location.hash.split(";");
    if (!params || !params[0] || !params[1] || !params[2]) {
      document.write("ERR: all fields are required.");
      return;
    }
    let img = params[0];
    let port = params[1];
    let node = params[2];
    window.img = img;
    window.port = port;
    window.node = node;
    setTimeout(() => {
      document.querySelector("iframe").src =
        `/vnc/vnc.html?path=ws/${node}/port/${port}/websockify&autoconnect=true&scaling=remote&password=12345678&quality=6&compression=5&logging=info&reconnect=true&reconnect_delay=2000`;
    }, 200);

    // todo actually get from deblokmanager node, but for now we're gonna use slightly lower than inital default keepalive.
    setTimeout(async () => {
      await fetch("/api/container/keepalive", {
        verbose:true,
        method: "POST",
        body: JSON.stringify({
          id: img.replace("#", ""),
          node: Number(params[2]),
          for: localStorage["username"],
        }),
      });
      let UI = document.querySelector("iframe").contentWindow.novncui;
      window.UI = UI;
    }, 3000);
    setInterval(async () => {
      await fetch("/api/container/keepalive", {
        verbose:true,
        method: "POST",
        body: JSON.stringify({
          id: img.replace("#", ""),
          node: Number(params[2]),
          for: localStorage["username"],
        }),
      });
    }, 45000);
    window.history.pushState(
      { pageTitle: "Student Dashboard" },
      "",
      `/#/student/dashboard?__jsession=${crypto.randomUUID()}`,
    );
  })(); /*
  setInterval(() => {
    document.querySelector("iframe").contentDocument.querySelector("#noVNC_control_bar_anchor").style.display = "none"
    document.querySelector("iframe").contentDocument.querySelector("#noVNC_control_bar").style.display = "none"
  }, 100);*/
  let UI;
  setTimeout(() => {
    UI = document.querySelector("iframe").contentWindow.novncui;
    setTimeout(() => {
      alert(
        "Hello! If you get a failed to connect error, wait a few seconds and try again. I will automatically try and connect after 5 seconds.",
      );
    }, 1500);
  }, 1000);
  setTimeout(() => {
    let UI = document.querySelector("iframe").contentWindow.novncui;
    window.UI = UI;
    if (!window.UI.rfb) {
      window.UI.connect();
    }
  }, 5700);
  setInterval(() => {
    let ele = document
      .querySelector("iframe")
      .contentDocument.querySelectorAll(".noVNC_button");
    for (let i = 0; i < ele.length; i++) {
      ele[i].style.display = "none";
    }
    document
      .querySelector("iframe")
      .contentDocument.querySelector("#noVNC_settings_button").style.display =
      "block";
  }, 500);
  let showingClipboard = false;
  function toggleClipboard() {
    let UI = document.querySelector("iframe").contentWindow.novncui;
    if (showingClipboard) {
      showingClipboard = !showingClipboard;
      window.UI.closeClipboardPanel();
    } else {
      showingClipboard = !showingClipboard;
      window.UI.openClipboardPanel();
    }
  }
  function killContainer() {
    (async () => {
      let UI = document.querySelector("iframe").contentWindow.novncui;
      window.UI = UI;
      window.UI.closeConnectPanel();
      await fetch("/api/container/kill", {
        verbose:true,
        method: "POST",
        body: JSON.stringify({
          id: img.substring(1),
          node: node,
          for: localStorage.username,
        }),
      });
      setTimeout(() => {
        document.location = "/";
      }, 100);
    })();
  }
  function restartContainer() {
    (async () => {
      let UI = document.querySelector("iframe").contentWindow.novncui;
      window.UI = UI;
      setTimeout(() => {
        window.UI.showStatus("Restarting container...", "success", 3000);
        window.UI.closeConnectPanel();
      }, 300);

      let res = await fetch("/api/container/restart", {
        verbose:true,
        method: "POST",
        body: JSON.stringify({
          id: img.substring(1),
          node: node,
          for: localStorage.username,
        }),
      });
      if (res.ok) {
        window.UI.showStatus(
          "Restarted container, autoconnecting in 5 seconds...",
          "success",
          3000,
        );
        setTimeout(() => {
          window.UI.connect();
        }, 5700);
      } else {
        window.UI.connect();

        setTimeout(() => {
          window.UI.showStatus(
            "Failed to restart container. API buggy?",
            "error",
            3000,
          );
        }, 1000);
      }
    })();
  }