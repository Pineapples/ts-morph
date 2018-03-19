﻿import * as path from "path";
import {FileSystemHost, FileSystemWrapper} from "../fileSystem";

export class FileUtils {
    private static standardizeSlashesRegex = /\\/g;
    private static trimSlashStartRegex = /^\//;
    private static trimSlashEndRegex = /\/$/;

    static readonly ENOENT = "ENOENT";

    private constructor() {
    }

    /**
     * Gets if the error is a file not found or directory not found error.
     * @param err - Error to check.
     */
    static isNotExistsError(err: any) {
        return err.code === FileUtils.ENOENT;
    }

    /**
     * Ensure the directory exists synchronously.
     * @param fileSystemWrapper - File system wrapper.
     * @param dirPath - Directory path.
     */
    static ensureDirectoryExistsSync(fileSystemWrapper: FileSystemWrapper, dirPath: string) {
        if (fileSystemWrapper.directoryExistsSync(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = path.dirname(dirPath);
        if (parentDirPath !== dirPath && path.dirname(parentDirPath) !== parentDirPath)
            FileUtils.ensureDirectoryExistsSync(fileSystemWrapper, parentDirPath);

        // make this directory
        fileSystemWrapper.mkdirSync(dirPath);
    }

    /**
     * Ensure the directory exists asynchronously.
     * @param host - File system host.
     * @param dirPath - Directory path.
     */
    static async ensureDirectoryExists(host: FileSystemWrapper, dirPath: string) {
        if (await host.directoryExists(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = path.dirname(dirPath);
        if (parentDirPath !== dirPath && path.dirname(parentDirPath) !== parentDirPath)
            await FileUtils.ensureDirectoryExists(host, parentDirPath);

        // make this directory
        await host.mkdir(dirPath);
    }

    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin(...paths: string[]) {
        return FileUtils.standardizeSlashes(path.join(...paths));
    }

    /**
     * Gets if the path is absolute.
     * @param fileOrDirPath - File or directory path.
     */
    static pathIsAbsolute(fileOrDirPath: string) {
        return path.isAbsolute(fileOrDirPath);
    }

    /**
     * Gets the standardized absolute path.
     * @param fileSystem - File system.
     * @param fileOrDirPath - Path to standardize.
     * @param relativeBase - Base path to be relative from.
     */
    static getStandardizedAbsolutePath(fileSystem: FileSystemHost, fileOrDirPath: string, relativeBase?: string) {
        const isAbsolutePath = path.isAbsolute(fileOrDirPath);
        if (relativeBase != null && !isAbsolutePath)
            fileOrDirPath = path.join(relativeBase, fileOrDirPath);
        else if (!isAbsolutePath)
            fileOrDirPath = path.join(fileSystem.getCurrentDirectory(), fileOrDirPath);

        return FileUtils.standardizeSlashes(path.normalize(fileOrDirPath));
    }

    /**
     * Gets the directory path.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirPath(fileOrDirPath: string) {
        return path.dirname(fileOrDirPath);
    }

    /**
     * Gets the base name.
     * @param fileOrDirPath - Path to get the base name from.
     */
    static getBaseName(fileOrDirPath: string) {
        return path.basename(fileOrDirPath);
    }

    /**
     * Gets the extension of the file name.
     * @param fileOrDirPath - Path to get the extension from.
     */
    static getExtension(fileOrDirPath: string) {
        const baseName = FileUtils.getBaseName(fileOrDirPath);
        const lastDotIndex = baseName.lastIndexOf(".");
        if (lastDotIndex <= 0) // for files like .gitignore, need to include 0
            return ""; // same behaviour as node
        const lastExt = baseName.substring(lastDotIndex);
        const lastExtLowerCase = lastExt.toLowerCase();
        if (lastExtLowerCase === ".ts" && baseName.substring(lastDotIndex - 2, lastDotIndex).toLowerCase() === ".d")
            return baseName.substring(lastDotIndex - 2);
        if (lastExtLowerCase === ".map" && baseName.substring(lastDotIndex - 3, lastDotIndex).toLowerCase() === ".js")
            return baseName.substring(lastDotIndex - 3);
        return lastExt;
    }

    /**
     * Changes all back slashes to forward slashes.
     * @param fileOrDirPath - Path.
     */
    static standardizeSlashes(fileOrDirPath: string) {
        return fileOrDirPath.replace(this.standardizeSlashesRegex, "/");
    }

    /**
     * Checks if a path ends with a specified search path.
     * @param fileOrDirPath - Path.
     * @param endsWithPath - Ends with path.
     */
    static pathEndsWith(fileOrDirPath: string | undefined, endsWithPath: string | undefined) {
        const pathItems = FileUtils.splitPathBySlashes(fileOrDirPath);
        const endsWithItems = FileUtils.splitPathBySlashes(endsWithPath);

        if (endsWithItems.length > pathItems.length)
            return false;

        for (let i = 0; i < endsWithItems.length; i++) {
            if (endsWithItems[endsWithItems.length - i - 1] !== pathItems[pathItems.length - i - 1])
                return false;
        }

        return endsWithItems.length > 0;
    }

    /**
     * Checks if a path starts with a specified search path.
     * @param fileOrDirPath - Path.
     * @param startsWithPath - Starts with path.
     */
    static pathStartsWith(fileOrDirPath: string | undefined, startsWithPath: string | undefined) {
        const pathItems = FileUtils.splitPathBySlashes(fileOrDirPath);
        const startsWithItems = FileUtils.splitPathBySlashes(startsWithPath);

        if (startsWithItems.length > pathItems.length)
            return false;

        for (let i = 0; i < startsWithItems.length; i++) {
            if (startsWithItems[i] !== pathItems[i])
                return false;
        }

        return startsWithItems.length > 0;
    }

    private static splitPathBySlashes(fileOrDirPath: string | undefined) {
        fileOrDirPath = (fileOrDirPath || "").replace(FileUtils.trimSlashStartRegex, "").replace(FileUtils.trimSlashEndRegex, "");
        return FileUtils.standardizeSlashes(fileOrDirPath).replace(/^\//, "").split("/");
    }

    /**
     * Reads a file or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static async readFileOrNotExists(fileSystem: FileSystemHost, filePath: string, encoding: string) {
        try {
            return await fileSystem.readFile(filePath, encoding);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
            return false;
        }
    }

    /**
     * Reads a file synchronously or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static readFileOrNotExistsSync(fileSystem: FileSystemHost, filePath: string, encoding: string) {
        try {
            return fileSystem.readFileSync(filePath, encoding);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
            return false;
        }
    }

    /**
     * Gets the text with a byte order mark.
     * @param text - Text.
     */
    static getTextWithByteOrderMark(text: string) {
        const bom = "\ufeff";
        if (text[0] === bom)
            return text;
        return bom + text;
    }

    /**
     * Gets the relative path from one absolute path to another.
     * @param absolutePathFrom - Absolute path from.
     * @param absolutePathTo - Absolute path to.
     */
    static getRelativePathTo(absolutePathFrom: string, absolutePathTo: string) {
        const relativePath = path.relative(path.dirname(absolutePathFrom), path.dirname(absolutePathTo));
        return FileUtils.standardizeSlashes(path.join(relativePath, path.basename(absolutePathTo)));
    }
}
