#!/usr/bin/env python3
"""
Script para processar metadados do FontAwesome 7 Pro e gerar JSON estruturado
para uso no FrotiX Web.

Inputs:
- categories.yml: Mapeamento de categorias para ícones
- icons.json: Metadados completos de todos os ícones

Output:
- fontawesome-icons.json: JSON estruturado com categorias e ícones duotone
"""

import json
import yaml
import sys
from pathlib import Path

def load_yaml(file_path):
    """Carrega arquivo YAML"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def load_json(file_path):
    """Carrega arquivo JSON"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, file_path):
    """Salva JSON formatado"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def process_fontawesome_metadata(categories_file, icons_file, output_file):
    """
    Processa metadados do FontAwesome e gera JSON estruturado

    Args:
        categories_file: Caminho para categories.yml
        icons_file: Caminho para icons.json
        output_file: Caminho para arquivo de saída
    """
    print("Carregando arquivos de entrada...")
    categories_data = load_yaml(categories_file)
    icons_data = load_json(icons_file)

    print(f"[OK] {len(categories_data)} categorias carregadas")
    print(f"[OK] {len(icons_data)} icones carregados")

    # Filtrar apenas ícones com estilo duotone
    duotone_icons = {}
    for icon_name, icon_info in icons_data.items():
        if 'styles' in icon_info and 'duotone' in icon_info['styles']:
            duotone_icons[icon_name] = icon_info

    print(f"[OK] {len(duotone_icons)} icones com estilo duotone")

    # Criar mapeamento de ícone -> categorias (para ícones que aparecem em múltiplas categorias)
    icon_to_categories = {}
    for cat_key, cat_info in categories_data.items():
        if 'icons' in cat_info:
            for icon_name in cat_info['icons']:
                if icon_name not in icon_to_categories:
                    icon_to_categories[icon_name] = []
                icon_to_categories[icon_name].append(cat_key)

    # Construir estrutura de saída
    output_categories = []

    for cat_key, cat_info in categories_data.items():
        category_label = cat_info.get('label', cat_key.replace('-', ' ').title())
        category_id = f"cat_{cat_key}"

        # Processar ícones da categoria
        category_icons = []

        if 'icons' in cat_info:
            for icon_name in cat_info['icons']:
                # Verificar se o ícone suporta duotone
                if icon_name in duotone_icons:
                    icon_info = duotone_icons[icon_name]

                    # Extrair informações do ícone
                    icon_label = icon_info.get('label', icon_name.replace('-', ' ').title())
                    keywords = icon_info.get('search', {}).get('terms', [])

                    # Criar objeto do ícone
                    icon_obj = {
                        "id": f"fa-duotone fa-{icon_name}",
                        "text": icon_label,
                        "parentId": category_id,
                        "keywords": keywords
                    }

                    category_icons.append(icon_obj)

        # Ordenar ícones alfabeticamente por texto
        category_icons.sort(key=lambda x: x['text'].lower())

        # Criar objeto da categoria
        if category_icons:  # Apenas incluir categorias com ícones duotone
            category_obj = {
                "id": category_id,
                "text": category_label,
                "isCategory": True,
                "hasChild": True,
                "expanded": False,
                "icons": category_icons
            }

            output_categories.append(category_obj)

    # Ordenar categorias alfabeticamente por texto
    output_categories.sort(key=lambda x: x['text'].lower())

    # Estrutura final
    output_data = {
        "version": "7.0",
        "categories": output_categories
    }

    # Estatísticas
    total_icon_entries = sum(len(cat['icons']) for cat in output_categories)

    print(f"\n[OK] Estrutura gerada:")
    print(f"  - {len(output_categories)} categorias com icones duotone")
    print(f"  - {total_icon_entries} entradas de icones (incluindo duplicatas)")

    # Salvar arquivo
    print(f"\nSalvando em: {output_file}")
    save_json(output_data, output_file)
    print("[OK] Arquivo salvo com sucesso!")

    # Mostrar algumas estatísticas adicionais
    print(f"\n[STATS] Estatisticas:")
    print(f"  - Top 5 categorias com mais icones:")
    top_categories = sorted(output_categories, key=lambda x: len(x['icons']), reverse=True)[:5]
    for i, cat in enumerate(top_categories, 1):
        print(f"    {i}. {cat['text']}: {len(cat['icons'])} icones")

if __name__ == "__main__":
    # Caminhos dos arquivos
    base_path = Path(r"c:\Users\Administrator\Downloads\kit-afeb78ad1f-desktop\metadata")
    categories_file = base_path / "categories.yml"
    icons_file = base_path / "icons.json"
    output_file = Path(r"C:\FrotiX\_FrotiXCompleto 2025 (valendo)\FrotiX.Site\fontawesome-icons.json")

    # Verificar se os arquivos existem
    if not categories_file.exists():
        print(f"[ERRO] Arquivo nao encontrado: {categories_file}")
        sys.exit(1)

    if not icons_file.exists():
        print(f"[ERRO] Arquivo nao encontrado: {icons_file}")
        sys.exit(1)

    # Processar
    print("=" * 60)
    print("FontAwesome 7 Pro - Processador de Metadados")
    print("=" * 60)
    process_fontawesome_metadata(categories_file, icons_file, output_file)
    print("\n" + "=" * 60)
    print("[OK] Processamento concluido!")
    print("=" * 60)
