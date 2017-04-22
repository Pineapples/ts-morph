---
title: Enums
---

## Enums

Enums can be retrieved from source files, namespaces, or function bodies:

```typescript
const enums = sourceFile.getEnums();
const enum1 = sourceFile.getEnum("Enum1");
const enum2 = sourceFile.getEnum(e => e.getMembers().length === 5);
```

### Adding

You can add enums to a source file or namespace by calling `addEnum()`:

```typescript
const enumDeclaration = sourceFile.addEnum({
    name: "EnumName",
    members: [{
        name: "member"
    }]
});
```

### Add member

Members can be added by calling `addMember()`:

```typescript
const member = enumDeclaration.addMember({
    name: "newMember",
    value: 10
});
```

### Get all members

Use `getMembers()`:

```typescript
const members = enumDeclaration.getMembers();
```

### Get member

Use `getMember()`:

```typescript
const member1 = enumDeclaration.getMember("member1");
const member2 = enumDeclaration.getMember(m => m.getValue() === 1);
```

### Const enum

Check if it's a const enum via `isConstEnum()`:

```typescript
enumDeclaration.isConstEnum(); // returns: boolean
```

Get the `const` keyword via `getConstKeyword()`:

```typescript
enumDeclaration.getConstKeyword(); // returns: Node | undefined
```

Set if it's a const enum via `setIsConstEnum(value)`:

```typescript
enumDeclaration.setIsConstEnum(true);
enumDeclaration.setIsConstEnum(false);
```

## Enum Members

```typescript
const member = enumDeclaration.getMember("member");
```

### Get the value

The value can be retrieved whether it is implicitly or explicitly defined:

```typescript
member.getValue(); // returns: number
```

### Following comma

Enum members may have a comma after them. You can check for that via:

```typescript
member.hasFollowingComma(); // returns: boolean
```

And get it via:

```typescript
member.getFollowingComma(); // returns: node | undefined
```

### Remove a Member

Call `remove()` on it:

```typescript
member.remove();
```