const fs = require('fs');
const path = require('path');

const dirs = ['layout', 'auth', 'workspace', 'student', 'profile'];
const baseDir = path.join(__dirname, 'src', 'app', 'components');

dirs.forEach(dir => {
  const dirPath = path.join(baseDir, dir);
  if (!fs.existsSync(dirPath)) return;
  
  fs.readdirSync(dirPath).forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const filePath = path.join(dirPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix firebase imports: "../../firebase" -> "../../../firebase"
      content = content.replace(/['"]\.\.\/\.\.\/firebase['"]/g, '"../../../firebase"');
      
      // Fix type imports: "../types" -> "../../types"
      content = content.replace(/['"]\.\.\/types['"]/g, '"../../types"');
      
      // Fix UI component imports: "./ui/X" -> "../ui/X"
      content = content.replace(/['"]\.\/ui\//g, '"../ui/');
      
      // Fix generic UI card imports if they used "./Card" instead of "./ui/Card" (wait, they were in the same dir? No, Card was in ui/Card)
      content = content.replace(/['"]\.\/Card['"]/g, '"../ui/Card"');

      // Fix specific cross-component imports if any
      // e.g. import { WorkspaceTasks } from "./WorkspaceTasks"
      // -> import { WorkspaceTasks } from "../workspace/WorkspaceTasks"
      // Since they were all in the same folder previously.
      
      // Let's just fix generic local imports "./X" that aren't starting with "."
      content = content.replace(/from ['"]\.\/([A-Za-z0-9_]+)['"]/g, (match, compName) => {
        // If it's importing a component that moved, we need to point to its new folder
        const mappings = {
          'Header': 'layout', 'Sidebar': 'layout',
          'LoginScreen': 'auth',
          'WorkspaceFeedback': 'workspace', 'WorkspaceFiles': 'workspace', 'WorkspaceTasks': 'workspace', 'WorkspaceTeam': 'workspace', 'WorkspaceUpdates': 'workspace',
          'StudentFiles': 'student', 'StudentTasks': 'student', 'StudentTeam': 'student', 'StudentUpdates': 'student',
          'GenericProfile': 'profile'
        };
        if (mappings[compName]) {
            if (mappings[compName] === dir) {
                // Same folder now
                return `from "./${compName}"`;
            } else {
                // Different folder
                return `from "../${mappings[compName]}/${compName}"`;
            }
        }
        // If it was something else, it's probably now in the parent dir (the old components dir)
        return `from "../${compName}"`;
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
});
