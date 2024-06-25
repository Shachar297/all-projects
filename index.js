require("dotenv").config();

const
    axios = require("axios"),
    method = "GET",
    fs = require("fs");

let allProjects = [];

fetchAllProjects();

async function fetchAllProjects() {
    try {
        const groups = await getAllGroups();
        const projectPromises = groups.map(async group => {
            const projects = await getAllProjects(group.id);
            return projects.map(project => project.name);
        });

        const projectsArrays = await Promise.all(projectPromises);
        allProjects = projectsArrays.flat();

        fs.writeFileSync('projects.json', JSON.stringify(allProjects, null, 2)); 
        console.log("Projects listed to project.json");
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

function getAllGroups() {
    const apiEndpoint = `https://rdgit.lumenis.com/api/v4/groups`;

    return axios.get(`${apiEndpoint}`, { headers: headersHandler(apiEndpoint, method) })
        .then(response => response.data)
        .catch(e => {
            console.error(" *::getAllGroups Function", e);
            return [];
        });
}

function getAllProjects(groupId) {
    const apiEndpoint = `https://rdgit.lumenis.com/api/v4/groups/${groupId}/projects`;

    return axios.get(`${apiEndpoint}`, { headers: headersHandler(apiEndpoint, method) })
        .then(response => response.data)
        .catch(e => {
            console.error(" *::getAllProjects Function ", e);
            return [];
        });
}

function headersHandler(url, method) {
    let headers = {};
    if (url.indexOf("gitlab") > -1 || url.indexOf("rdgit.lumenis") > -1) {

        if (method != "GET") {
            console.error("Will not modify or create any resource under gitlab organization!");
            return;
        }
        headers["PRIVATE-TOKEN"] = process.env.gitlabToken
    } else {
        switch (method) {
            case "POST":
                headers = {
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
                break;

            case "GET":
                break;
        }
        headers.authorization = `Bearer ${process.env.githubToken}`
    }

    return headers
}