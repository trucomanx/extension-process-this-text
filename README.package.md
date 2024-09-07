# Install the last version of node
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    source ~/.bashrc
    sudo  nvm install --lts

# Create a extension example code

    #sudo npm uninstall -g yo generator-code
    sudo npm install -g yo generator-code
    yo code

# Compile the extension code

    npm run compile


# Create the vsix file

    npm install --save-dev @types/vscode
    
    npm install axios # llama
    npm install @anthropic-ai/sdk # claude
    npm install openai # gpt
    npm install -g vsce
    vsce package

# Execute installed extension

Press `Ctrl+Shift+P` and write `TrucomanX`.
