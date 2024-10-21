import React from 'react';
import styled from 'styled-components';

const GuideContainer = styled.div`
  padding: 16px;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
`;

const GuideTitle = styled.h2`
  margin-bottom: 12px;
  font-weight: bold;
  color: #2c3e50;
`;

const GuideSection = styled.div`
  margin-bottom: 20px;
`;

const GuideStep = styled.div`
  margin-bottom: 10px;
`;

const GuideStepNumber = styled.h3`
  margin-bottom: 5px;
  font-weight: bold;
  color: #3498db;
`;

const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
`;

const BulletItem = styled.li`
  margin-bottom: 8px;
  color: #555;
`;

const Highlight = styled.code`
  color: #e91e63;
`;

const CodeSnippet = styled.pre`
  background-color: #333;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
`;

export const DevelopersGuide = () => {
  return (
    <GuideContainer>
      <GuideTitle>Developers Guide for tx-react-component</GuideTitle>

      <GuideSection>
        <GuideStep>
          <GuideStepNumber>Step 1: Clone the Repository</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Clone the repository using the following command:
              <CodeSnippet>git clone &lt;git_repository_url&gt;</CodeSnippet>
            </BulletItem>
            <BulletItem>
              Since the repository is hosted on Azure DevOps, you may need to provide an authentication token. You can generate a token from your Azure DevOps account and use it in the URL when cloning.
            </BulletItem>
            <BulletItem>
              Example with token:
              <CodeSnippet>
                git clone https://&lt;username&gt;:&lt;token&gt;@dev.azure.com/&lt;organization&gt;/&lt;project&gt;/_git/&lt;repository&gt;
              </CodeSnippet>
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 2: Create a Sub-branch</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Create a new branch to work on your feature or fix. It's important to create a sub-branch for your changes to ensure isolation and easier tracking.
              <CodeSnippet>git checkout -b feature/your-component-name</CodeSnippet>
            </BulletItem>
            <BulletItem>
              Follow a consistent naming convention: <Highlight>feature/your-component-name</Highlight> for features or <Highlight>bugfix/your-bugfix-name</Highlight> for bug fixes.
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 3: Install Dependencies</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Run <Highlight>npm install</Highlight> to install the project dependencies. This ensures you have all the libraries and tools needed to develop and test your component.
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 4: Create a New Component</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Inside the `src/components/` folder, create a new folder for your component. The component should follow this structure:
              <CodeSnippet>
                {`/Button/
  - index.tsx      // Main component logic
  - styled.tsx     // Component styles
  - utils.tsx      // Utility functions
  - stories.tsx    // Storybook example
  - interface.ts   // Props interface
                `}
              </CodeSnippet>
            </BulletItem>
            <BulletItem>
              Here’s an example of a simple button component:
            </BulletItem>
            <CodeSnippet>{`// Button/index.tsx
import React from 'react';
import { ButtonStyled } from './styled';
import { ButtonProps } from './interface';

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <ButtonStyled onClick={onClick}>{label}</ButtonStyled>;
};`}</CodeSnippet>
            
            <CodeSnippet>{`// Button/styled.tsx
import styled from 'styled-components';

export const ButtonStyled = styled.button\`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
\`;`}</CodeSnippet>

            <CodeSnippet>{`// Button/utils.tsx
export const handleButtonClick = () => {
  console.log('Button clicked');
};`}</CodeSnippet>

            <CodeSnippet>{`// Button/stories.tsx
import React from 'react';
import { Button } from './index';

export default {
  title: 'Example/Button',
  component: Button,
};

export const DefaultButton = () => <Button label="Click Me" onClick={() => alert('Button Clicked')} />;`}</CodeSnippet>

            <CodeSnippet>{`// Button/interface.ts
export interface ButtonProps {
  label: string;
  onClick: () => void;
};`}</CodeSnippet>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 5: Versioning Guide</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Before committing any changes, understand the versioning system: <Highlight>MAJOR.MINOR.PATCH</Highlight>.
            </BulletItem>
            <BulletItem>
              - **MAJOR**: Increment for breaking changes or major updates.
            </BulletItem>
            <BulletItem>
              - **MINOR**: Increment when adding or removing a component or feature.
            </BulletItem>
            <BulletItem>
              - **PATCH**: Increment for bug fixes or minor updates.
            </BulletItem>
            <BulletItem>
              Always update the version in the `package.json` file before committing.
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 6: Commit and Push Changes</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Once your component is tested and ready, commit your changes:
              <CodeSnippet>git commit -m "Added Button component"</CodeSnippet>
            </BulletItem>
            <BulletItem>
              Push your changes to the origin:
              <CodeSnippet>git push origin feature/your-component-name</CodeSnippet>
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 7: Create a Pull Request (PR)</GuideStepNumber>
          <BulletList>
            <BulletItem>
              Once your changes are pushed, head over to Azure DevOps and create a Pull Request (PR). Provide a meaningful title and description of your changes.
            </BulletItem>
          </BulletList>
        </GuideStep>

        <GuideStep>
          <GuideStepNumber>Step 8: Publish</GuideStepNumber>
          <BulletList>
            <BulletItem>
              After your PR is approved and merged, update the version in `package.json` and run:
              <CodeSnippet>npm publish</CodeSnippet>
            </BulletItem>
          </BulletList>
        </GuideStep>
      </GuideSection>

      <GuideSection>
        <GuideStepNumber>Takeaways:</GuideStepNumber>
        <BulletList>
          <BulletItem>
            Always follow the <Highlight>MAJOR.MINOR.PATCH</Highlight> versioning convention.
          </BulletItem>
          <BulletItem>
            Maintain consistent file structure: <Highlight>/ComponentName/index.tsx, styled.tsx, utils.tsx, stories.tsx, interface.ts</Highlight>.
          </BulletItem>
          <BulletItem>
            Refer to other components as examples for structure and implementation.
          </BulletItem>
        </BulletList>
      </GuideSection>

      <GuideSection>
        <GuideStepNumber>Author & Contacts:</GuideStepNumber>
        <BulletList>
          <BulletItem>
            **Author:** <Highlight>King Aguire &lt;king.aguirre@example.com&gt;</Highlight>
          </BulletItem>
          <BulletItem>
            For further assistance, feel free to contact:
            <Highlight>Jane Doe &lt;jane.doe@example.com&gt;</Highlight>
            <Highlight>John Smith &lt;john.smith@example.com&gt;</Highlight>
          </BulletItem>
        </BulletList>
      </GuideSection>

      <GuideSection>
        <GuideTitle>How to Use the Package in Another Repository:</GuideTitle>
        {/* <GuideStepNumber>How to Use the Package in Another Repository:</GuideStepNumber> */}
        <BulletList>
          <BulletItem>1. **Install the package** by running:</BulletItem>
          <CodeSnippet>npm install tx-react-component</CodeSnippet>

          <BulletItem>2. **Import the desired component**:</BulletItem>
          <CodeSnippet>{`import { Button } from 'tx-react-component';`}</CodeSnippet>

          <BulletItem>3. **Use the component** and provide the necessary props:</BulletItem>
          <CodeSnippet>{`<Button label="Submit" onClick={handleSubmit} />`}</CodeSnippet>
        </BulletList>
      </GuideSection>
    </GuideContainer>
  );
};
