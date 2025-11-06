import {
	IsArray,
	IsObject,
} from 'class-validator';



export class CreateTreeLinkDto {
	@IsArray()
	@IsObject({ each: true })
	nodes: unknown[];

	@IsArray()
	@IsObject({ each: true })
	edges: unknown[];
}

export class TreeDto {
	@IsObject()
	tree: CreateTreeLinkDto;
}
