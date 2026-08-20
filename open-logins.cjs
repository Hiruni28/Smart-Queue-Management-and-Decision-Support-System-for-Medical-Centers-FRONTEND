const { spawn, exec } = require("child_process");
const http = require("http");

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

let viteProcess = null;


// ============================================================
// CHECK IF VITE IS ALREADY RUNNING
// ============================================================

function isServerRunning() {
    return new Promise((resolve) => {

        const request = http.get(
            `${BASE_URL}/`,
            (response) => {

                response.resume();
                resolve(true);

            }
        );

        request.on("error", () => {
            resolve(false);
        });

        request.setTimeout(1000, () => {

            request.destroy();

            resolve(false);

        });

    });
}


// ============================================================
// WAIT FOR VITE
// ============================================================

async function waitForServer() {

    console.log("Waiting for Vite server...");

    for (let i = 0; i < 30; i++) {

        if (await isServerRunning()) {

            console.log("Vite server is ready.");

            return true;
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    return false;
}


// ============================================================
// START VITE
// ============================================================

async function startVite() {

    const alreadyRunning = await isServerRunning();

    if (alreadyRunning) {

        console.log(
            "Vite is already running on http://localhost:5173"
        );

        return true;
    }


    console.log("Starting Vite...");


    const commandProcessor =
        process.env.ComSpec ||
        "C:\\Windows\\System32\\cmd.exe";


    viteProcess = spawn(
        commandProcessor,
        [
            "/d",
            "/s",
            "/c",
            "npm run dev"
        ],
        {
            stdio: "inherit",
            windowsVerbatimArguments: true
        }
    );


    viteProcess.on("error", (error) => {

        console.error("");
        console.error("Failed to start Vite:");
        console.error(error);
        console.error("");

    });


    viteProcess.on("exit", (code) => {

        if (code !== null && code !== 0) {

            console.error(
                `Vite stopped with exit code ${code}`
            );

        }

    });


    const ready = await waitForServer();


    if (!ready) {

        console.error("");
        console.error(
            "ERROR: Vite did not start on port 5173."
        );
        console.error("");

        return false;
    }


    return true;
}


// ============================================================
// OPEN ADMIN LOGIN
// ============================================================

function openAdminLogin() {

    console.log(
        "Opening Admin Login..."
    );

    exec(
        `start "" msedge --new-window "${BASE_URL}/admin-login"`,
        (error) => {

            if (error) {

                console.error(
                    "Could not open Admin Login:",
                    error.message
                );

            }
        }
    );
}


// ============================================================
// OPEN STAFF LOGIN
// ============================================================

function openStaffLogin() {

    console.log(
        "Opening Staff Login..."
    );

    exec(
        `start "" msedge --new-window "${BASE_URL}/staff-login"`,
        (error) => {

            if (error) {

                console.error(
                    "Could not open Staff Login:",
                    error.message
                );

            }
        }
    );
}


// ============================================================
// OPEN HOME PAGE
// ============================================================

function openHome() {

    console.log(
        "Opening Home Page..."
    );

    exec(
        `start "" msedge --new-window "${BASE_URL}/"`,
        (error) => {

            if (error) {

                console.error(
                    "Could not open Home Page:",
                    error.message
                );

            }
        }
    );
}


// ============================================================
// OPEN ALL THREE
// ============================================================

function openLoginWindows() {

    console.log("");
    console.log(
        "Opening Admin, Staff and Home pages..."
    );
    console.log("");


    // Window 1
    openAdminLogin();


    // Window 2
    setTimeout(() => {

        openStaffLogin();

    }, 700);


    // Window 3
    setTimeout(() => {

        openHome();

    }, 1400);
}


// ============================================================
// MAIN
// ============================================================

async function main() {

    console.log("");
    console.log(
        "=========================================="
    );
    console.log(
        " Hospital Queue Management System"
    );
    console.log(
        " Login Launcher"
    );
    console.log(
        "=========================================="
    );
    console.log("");


    const viteStarted = await startVite();


    if (!viteStarted) {

        console.error(
            "Login launcher stopped."
        );

        process.exit(1);
    }


    // Give Vite a moment after becoming reachable
    setTimeout(() => {

        openLoginWindows();

    }, 1000);
}


// ============================================================
// START
// ============================================================

main();