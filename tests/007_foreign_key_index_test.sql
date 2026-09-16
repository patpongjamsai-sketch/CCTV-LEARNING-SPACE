\set ON_ERROR_STOP on

select test_support.assert_true(
  not exists (
    select 1
    from pg_constraint as fk
    join pg_class as relation on relation.oid = fk.conrelid
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where fk.contype = 'f'
      and namespace.nspname = 'public'
      and not exists (
        select 1
        from pg_index as index_definition
        where index_definition.indrelid = fk.conrelid
          and index_definition.indisvalid
          and index_definition.indisready
          and index_definition.indnkeyatts >= cardinality(fk.conkey)
          and not exists (
            select 1
            from unnest(fk.conkey) with ordinality as fk_column(attnum, position)
            where fk_column.attnum
              <> index_definition.indkey[fk_column.position - 1]
          )
      )
  ),
  'every public foreign key must have a covering index prefix'
);

