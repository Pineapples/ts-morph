﻿import * as errors from "../../errors";
import {ts} from "../../typescript";
import {Node} from "../../compiler";
import {CompilerFactory} from "../../factories";
import {NodeHandler} from "./NodeHandler";
import {NodeHandlerHelper} from "./NodeHandlerHelper";

/**
 * Replacement handler for replacing parts of the tree that should be equal.
 */
export class StraightReplacementNodeHandler implements NodeHandler {
    private readonly helper: NodeHandlerHelper;

    constructor(private readonly compilerFactory: CompilerFactory) {
        this.helper = new NodeHandlerHelper(compilerFactory);
    }

    handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(`Error replacing tree! Perhaps a syntax error was inserted ` +
                `(Current: ${currentNode.getKindName()} -- New: ${newNode.getKindName()}).`);

        const newNodeChildren = newNode.getChildrenIterator();

        for (const currentNodeChild of currentNode.getCompilerChildren())
            this.helper.handleForValues(this, currentNodeChild, newNodeChildren.next().value);

        /* istanbul ignore if */
        if (!newNodeChildren.next().done)
            throw new Error("Error replacing tree: Should not have new children left over.");

        this.compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
