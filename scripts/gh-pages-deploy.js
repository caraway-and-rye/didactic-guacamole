import execa from "execa";
import fs from "fs";

(async () => {
try {
    await execa("git", ["update-index", "--refresh"]); 
    const { stdout } = await execa("git", ["diff-index", "HEAD"]);
    if (stdout) {
        console.log("Please stash or commit changes first!");
        // eslint-disable-next-line no-undef
        process.exit(1);
    }

    await execa("git", ["checkout", "--orphan", "gh-pages"]);
    console.log("Building...");
    await execa("npm", ["run", "build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";
    await execa("git", ["--work-tree", folderName, "add", "--all"]);
    await execa("git", ["--work-tree", folderName, "commit", "-m", "gh-pages"]);
    console.log("Pushing to gh-pages...");
    await execa("git", ["push", "origin", "HEAD:gh-pages", "--force"]);
    await execa("rm", ["-r", folderName]);
    console.log("Successfully deployed");
} catch (e) {
    console.log(e.message);
    // eslint-disable-next-line no-undef
    process.exit(1);
}
finally {
    await execa("git", ["checkout", "-f", "main"]);
    await execa("git", ["branch", "-D", "gh-pages"]);
}
})();