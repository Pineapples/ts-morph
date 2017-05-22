﻿import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

/**
 * Insert into a syntax list.
 * @param sourceFile - Source file to manipulate.
 * @param insertPos - Insert position in the code.
 * @param newText - Next text to insert.
 * @param syntaxList - Syntax list to insert to.
 * @param childIndex - Child index to insert at.
 * @param insertItemsCount - Number of items to insert.
 */
export function insertIntoSyntaxList(sourceFile: SourceFile, insertPos: number, newText: string, syntaxList: Node, childIndex: number, insertItemsCount: number) {
    const syntaxListChildren = Array.from(syntaxList.getChildren(sourceFile));
    const syntaxListParent = syntaxList.getParent();

    if (childIndex < 0 || childIndex > syntaxListChildren.length)
        throw new errors.ArgumentError(nameof(childIndex), `Range is 0 to ${syntaxListChildren.length}, but ${childIndex} was provided.`);

    const compilerFactory = sourceFile.factory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    handleNode(sourceFile, tempSourceFile);

    function areNodesEqual(a: Node | undefined, b: Node | undefined) {
        if (a == null && b == null)
            return true;
        if (a == null || b == null)
            return false;
        if (a.getPos() === b.getPos() && a.getKind() === b.getKind())
            return true;
        return false;
    }

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error inserting into syntax list!", currentNode, newNode));

        const currentNodeChildren = currentNode.getChildrenIterator(sourceFile);

        for (const newNodeChild of newNode.getChildrenIterator(tempSourceFile)) {
            if (areNodesEqual(newNodeChild, syntaxList) && areNodesEqual(newNodeChild.getParent(), syntaxListParent))
                handleSyntaxList(currentNodeChildren.next().value, newNodeChild);
            else
                handleNode(currentNodeChildren.next().value, newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.node);
    }

    function handleSyntaxList(currentNode: Node, newNode: Node) {
        const currentNodeChildren = currentNode.getChildrenIterator();
        let i = 0;

        for (const newNodeChild of newNode.getChildren()) {
            if (i >= childIndex && i < childIndex + insertItemsCount) {
                i++;
                continue;
            }
            const currentChild = currentNodeChildren.next().value;
            handleNode(currentChild, newNodeChild);
            i++;
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.node);
    }
}
