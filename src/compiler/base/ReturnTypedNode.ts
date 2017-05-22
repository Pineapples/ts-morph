﻿import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertStraight} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

export type ReturnTypedNodeExtensionReturnType = Node<ts.SignatureDeclaration>;

export interface ReturnTypedNode {
    /**
     * Gets the return type.
     */
    getReturnType(): Type;
    /**
     * Gets the return type node or undefined if none exists.
     */
    getReturnTypeNode(): TypeNode | undefined;
    /**
     * Sets the return type of the node.
     * @param text - Text to set as the type.
     * @param sourceFile - Optional source file to help improve performance.
     */
    setReturnType(text: string, sourceFile?: SourceFile): this;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        getReturnType() {
            const typeChecker = this.factory.getTypeChecker();
            const signature = typeChecker.getSignatureFromNode(this);
            return typeChecker.getReturnTypeOfSignature(signature);
        }

        getReturnTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type);
        }

        setReturnType(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            // remove previous return type
            const returnTypeNode = this.getReturnTypeNode();
            const colonToken = returnTypeNode == null ? undefined : returnTypeNode.getPreviousSibling();
            /* istanbul ignore if */
            if (colonToken != null && colonToken.getKind() !== ts.SyntaxKind.ColonToken)
                throw new errors.NotImplementedError("Expected a colon token to be the previous sibling of a return type.");
            sourceFile.removeNodes(colonToken, returnTypeNode);

            // insert new type
            const closeParenToken = this.getFirstChildByKind(ts.SyntaxKind.CloseParenToken, sourceFile);
            /* istanbul ignore if */
            if (closeParenToken == null)
                throw new errors.NotImplementedError("Expected a close parenthesis to be a child of the return typed node.");

            insertStraight(sourceFile, closeParenToken.getEnd(), `: ${text}`);

            return this;
        }
    };
}
