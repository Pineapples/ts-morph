import {ts, SyntaxKind} from "../../typescript";
import {InterfaceDeclarationStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {callBaseFill} from "../callBaseFill";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, JSDocableNode, TypeParameteredNode, HeritageClauseableNode,
    ExtendsClauseableNode, TextInsertableNode, ChildOrderableNode, TypeElementMemberedNode} from "../base";
import {ClassDeclaration} from "../class";
import {NamespaceChildableNode} from "../namespace";
import {Statement} from "../statement";
import {Type, TypeAliasDeclaration} from "../type";
import {ImplementationLocation} from "../tools";

export const InterfaceDeclarationBase = TypeElementMemberedNode(ChildOrderableNode(TextInsertableNode(ExtendsClauseableNode(HeritageClauseableNode(
    TypeParameteredNode(JSDocableNode(AmbientableNode(NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(Statement)))))))
)))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<InterfaceDeclarationStructure>) {
        callBaseFill(InterfaceDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the base types.
     */
    getBaseTypes(): Type[] {
        return this.getType().getBaseTypes();
    }

    /**
     * Gets the base declarations.
     */
    getBaseDeclarations(): (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[] {
        return ArrayUtils.flatten(this.getType().getBaseTypes().map(t => {
            const symbol = t.getSymbol();
            return symbol == null ? [] : (symbol.getDeclarations() as (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[]);
        }));
    }

    /**
     * Gets all the implementations of the interface.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[] {
        return this.getNameNode().getImplementations();
    }
}
