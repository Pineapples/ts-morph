import * as ts from "typescript";
import * as errors from "./../../errors";
import * as structures from "./../../structures";
import {verifyAndGetIndex, insertIntoBracesOrSourceFile} from "./../../manipulation";
import {getNamedNodeByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as functions from "./../function";
import * as interfaces from "./../interface";
import * as namespaces from "./../namespace";
import * as types from "./../type";
import * as variable from "./../variable";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration>;

// todo: most of these should accept an optional sourceFile

export interface StatementedNode {
    /**
     * Gets the body node or returns the source file if a source file.
     */
    getBody(): Node;
    /**
     * Adds an enum declaration as a child.
     * @param structure - Structure of the enum declaration to add.
     * @param sourceFile - Optional source file to help with performance.
     */
    addEnum(structure: structures.EnumStructure, sourceFile?: SourceFile): enums.EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     * @param sourceFile - Optional source file to help with performance.
     */
    addEnums(structures: structures.EnumStructure[], sourceFile?: SourceFile): enums.EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     * @param sourceFile - Optional source file to help with performance.
     */
    insertEnum(index: number, structure: structures.EnumStructure, sourceFile?: SourceFile): enums.EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     * @param sourceFile - Optional source file to help with performance.
     */
    insertEnums(index: number, structures: structures.EnumStructure[], sourceFile?: SourceFile): enums.EnumDeclaration[];
    /**
     * Gets the direct class declaration children.
     */
    getClasses(): classes.ClassDeclaration[];
    /**
     * Gets a class.
     * @param name - Name of the class.
     */
    getClass(name: string): classes.ClassDeclaration | undefined;
    /**
     * Gets a class.
     * @param findFunction - Function to use to find the class.
     */
    getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
    /**
     * Gets the direct enum declaration children.
     */
    getEnums(): enums.EnumDeclaration[];
    /**
     * Gets an enum.
     * @param name - Name of the enum.
     */
    getEnum(name: string): enums.EnumDeclaration | undefined;
    /**
     * Gets an enum.
     * @param findFunction - Function to use to find the enum.
     */
    getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
    /**
     * Gets the direct function declaration children.
     */
    getFunctions(): functions.FunctionDeclaration[];
    /**
     * Gets a function.
     * @param name - Name of the function.
     */
    getFunction(name: string): functions.FunctionDeclaration | undefined;
    /**
     * Gets a function.
     * @param findFunction - Function to use to find the function.
     */
    getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
    /**
     * Gets the direct interface declaration children.
     */
    getInterfaces(): interfaces.InterfaceDeclaration[];
    /**
     * Gets an interface.
     * @param name - Name of the interface.
     */
    getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
    /**
     * Gets an interface.
     * @param findFunction - Function to use to find the interface.
     */
    getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
    /**
     * Gets the direct namespace declaration children.
     */
    getNamespaces(): namespaces.NamespaceDeclaration[];
    /**
     * Gets a namespace.
     * @param name - Name of the namespace.
     */
    getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
    /**
     * Gets a namespace.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
    /**
     * Gets the direct type alias declaration children.
     */
    getTypeAliases(): types.TypeAliasDeclaration[];
    /**
     * Gets a type alias.
     * @param name - Name of the type alias.
     */
    getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
    /**
     * Gets the direct variable statement children.
     */
    getVariableStatements(): variable.VariableStatement[];
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined;
    /**
     * Gets the variable declaration lists of the direct variable statement children.
     */
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    /**
     * Gets a variable declaration list.
     * @param findFunction - Function to use to find the variable declaration list.
     */
    getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined;
    /**
     * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
     */
    getVariableDeclarations(): variable.VariableDeclaration[];
    /**
     * Gets a variable declaration.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
    /**
     * Gets a variable declaration.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        getBody(): Node {
            /* istanbul ignore else */
            if (this.isSourceFile())
                return this;
            else if (this.isNamespaceDeclaration())
                return this.factory.getNodeFromCompilerNode(this.node.body);
            else if (this.isFunctionDeclaration()) {
                /* istanbul ignore if */
                if (this.node.body == null)
                    throw new errors.NotImplementedError("Function declaration has no body.");

                return this.factory.getNodeFromCompilerNode(this.node.body);
            }
            else
                throw this.getNotImplementedError();
        }

        addEnum(structure: structures.EnumStructure, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            return this.addEnums([structure], sourceFile)[0];
        }

        addEnums(structures: structures.EnumStructure[], sourceFile: SourceFile = this.getRequiredSourceFile()) {
            return this.insertEnums(this.getRequiredChildSyntaxList(sourceFile).getChildren(sourceFile).length, structures, sourceFile);
        }

        insertEnum(index: number, structure: structures.EnumStructure, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            return this.insertEnums(index, [structure], sourceFile)[0];
        }

        insertEnums(index: number, structures: structures.EnumStructure[], sourceFile: SourceFile = this.getRequiredSourceFile()) {
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText(sourceFile);
            const texts = structures.map(structure => `${indentationText}${structure.isConst ? "const " : ""}enum ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<enums.EnumDeclaration>(sourceFile, index, texts, ts.SyntaxKind.EnumDeclaration);

            for (let i = 0; i < newChildren.length; i++) {
                const newChild = newChildren[i];
                for (const member of structures[i].members || []) {
                    newChild.addMember(member);
                }
            }

            return newChildren;
        }

        getClasses(): classes.ClassDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        getClass(name: string): classes.ClassDeclaration | undefined;
        getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }

        getEnums(): enums.EnumDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        getEnum(name: string): enums.EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }

        getFunctions(): functions.FunctionDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }

        getTypeAliases(): types.TypeAliasDeclaration[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        getVariableStatements(): variable.VariableStatement[] {
            return this.getRequiredChildSyntaxList().getChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
        }

        getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined {
            return this.getVariableStatements().find(findFunction);
        }

        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined {
            return this.getVariableDeclarationLists().find(findFunction);
        }

        getVariableDeclarations(): variable.VariableDeclaration[] {
            const variables: variable.VariableDeclaration[] = [];

            for (const list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }

        getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
        getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: variable.VariableDeclaration) => boolean)): variable.VariableDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
        }

        private _insertMainChildren<T extends Node>(sourceFile: SourceFile, index: number, childCodes: string[], expectedSyntaxKind: ts.SyntaxKind) {
            const syntaxList = this.getRequiredChildSyntaxList();
            const mainChildren = syntaxList.getChildren();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            index = verifyAndGetIndex(index, mainChildren.length);

            // insert
            insertIntoBracesOrSourceFile({
                languageService: this.factory.getLanguageService(),
                sourceFile,
                parent: this as any as Node,
                children: mainChildren,
                index,
                childCodes,
                separator: newLineChar + newLineChar
            });
            this.appendNewLineSeparatorIfNecessary(sourceFile);

            // get children
            const newMainChildren = syntaxList.getChildren();
            const children = newMainChildren.slice(index, index + childCodes.length);
            for (const child of children) {
                if (child.getKind() !== expectedSyntaxKind)
                    throw new errors.NotImplementedError(`Unexpected! Inserting syntax kind of ${ts.SyntaxKind[expectedSyntaxKind]}` +
                        `, but ${child.getKindName()} was inserted.`);
            }
            return children as T[];
        }
    };
}

function getInsertPosition(node: StatementedNode & Node) {
    if (node.isSourceFile())
        return node.getEnd();
    else
        return node.getBody().getEnd() - 1;
}
