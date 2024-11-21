import { exec } from 'child_process'; // Import from 'child_process' using ES module syntax
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob'; // Import 'glob' using ES module syntax

// Helper function to get directory name (needed in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path where all interface.ts files are located
const interfaceFilePattern = 'src/**/interface.ts'; // Adjust this to match the location of your interfaces

// Find all interface.ts files in the specified path
glob(interfaceFilePattern, (err, files) => {
  if (err) {
    console.error('Error finding interface files:', err);
    return;
  }

  files.forEach((file) => {
    const dir = dirname(file); // Get the directory of each interface.ts file
    const outputPath = join(dir, 'interfaces.json'); // Set the output path for the generated JSON

    // Run the TypeDoc command for each interface.ts file
    const command = `npx typedoc --json ${outputPath} ${file}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating docs for ${file}:`, stderr);
      } else {
        console.log(`Documentation generated for ${file} at ${outputPath}`);
      }
    });
  });
});
