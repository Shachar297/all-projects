const
    axios = require('axios'),
    gitlabBaseUrl = "https://rdgit.lumenis.com/api/v4",
    gitlabToken = "glpat-XPhGazifb1h7gSzu-ryg";

function headers() {
    return {
        "Private-Token": gitlabToken,
        "Content-Type": "application/json"
    };
}

// Fetch all groups
async function getAllGroups() {
    const apiEndpoint = `${gitlabBaseUrl}/groups`;

    try {
        const response = await axios.get(apiEndpoint, { headers: headers() });
        return response.data;
    } catch (e) {
        console.error("Error in getAllGroups function:", e);
        return [];
    }
}

// Fetch all projects in a group
async function getAllProjects(groupId) {
    const apiEndpoint = `${gitlabBaseUrl}/groups/${groupId}/projects`;

    try {
        const response = await axios.get(apiEndpoint, { headers: headers() });
        return response.data;
    } catch (e) {
        console.error("Error in getAllProjects function:", e);
        return [];
    }
}

// Lock a project for pushing
async function lockProject(projectId) {
    // console.log(JSON.stringify(projectProtectedBranches, null, 2))
    const api = `${gitlabBaseUrl}/projects/${projectId}/protected_branches`;

    try {
        await axios.post(api, 
            await getProtectedBranches(projectId),
     { headers: headers() });
        console.log(`Locked project: ${projectId}`);
    } catch (e) {
        console.error(`Error in lockProject function for project ${projectId}:`, e);
    }
}

// Main function to handle locking all projects in all groups
async function handleLock() {
    const groups = await getAllGroups();
    for (const group of groups) {
        const groupId = group.id;
        const projects = await getAllProjects(groupId);
        for (const project of projects) {
            await sleep(2000)
            const projectId = project.id;
            // let projectProtectedBranches = await getProtectedBranches(project.id)
            await lockProject(projectId);
        }
    }
    console.log('All projects in all groups locked for pushing.');
}

async function sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

async function getProtectedBranches(projectId) {
    try {
        let protectedBranch = await axios.get(`${gitlabBaseUrl}/projects/${projectId}/protected_branches`, {headers: headers()})
        for(let i =0; i < protectedBranch.data.length; i++) {
            protectedBranch.data[i].push_access_levels[0].access_level = protectedBranch.data[i].push_access_levels[0].access_level = 0
            protectedBranch.data[i].merge_access_levels[0].access_level = protectedBranch.data[i].merge_access_levels[0].access_level = 0
        }
        return protectedBranch.data[0]   
    } catch (error) {
        console.log(error)
    }
}
// Execute the handleLock function
handleLock();